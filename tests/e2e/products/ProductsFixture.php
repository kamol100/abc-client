<?php

use App\Models\Company;
use App\Models\Reseller;
use App\Models\Role;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use App\Models\ProductIn;
use App\Models\ProductOut;
use App\Models\ProductSerial;
use App\Models\UnitType;
use App\Models\ProductCategory;
use App\Models\Staff;
use App\Models\Vendor;
use App\Models\ExpenseType;
use App\Tenant\Facades\Landlord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Container\Container;
use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('serves the isolated product browser fixture', function () {
    $password = getenv('PRD_E2E_PASSWORD');
    $storage = getenv('PRD_E2E_STORAGE');
    if (! is_string($password) || strlen($password) < 24 || ! is_string($storage) || ! is_dir($storage)
        || getenv('PRD_E2E_DISPOSABLE') !== '1') {
        throw new RuntimeException('The disposable product browser runner must start this fixture.');
    }

    $this->app->useStoragePath($storage);
    Queue::fake();
    Notification::fake();
    Http::fake();
    Storage::fake('local');

    $makeCompany = fn (string $name, string $domain): Company => Company::factory()->create(compact('name', 'domain'));
    $platform = $makeCompany('Product Test Platform', 'app.isp.test');
    $company = $makeCompany('Product Test CP', 'cp.isp.test');
    $other = $makeCompany('Product Test MK', 'mk.isp.test');
    expect($platform->id)->toBe(1);

    $makeUser = function (Company $company, string $username, ?string $roleName = null, array $grants = [], ?Reseller $reseller = null) use ($password): User {
        $name = str_replace('_', ' ', $username);
        $user = User::factory()->create([
            'company_id' => $company->id, 'reseller_id' => $reseller?->id,
            'name' => $name, 'username' => $username, 'password' => $password, 'status' => 1,
        ]);
        if ($roleName !== null) {
            setPermissionsTeamId($company->id);
            $role = Role::create([
                'name' => $roleName, 'display_name' => $roleName,
                'company_id' => $company->id, 'guard_name' => 'sanctum',
            ]);
            foreach ($grants as $grant) {
                $role->givePermissionTo(Permission::findOrCreate($grant, 'sanctum'));
            }
            $user->assignRole($role);
        }

        return $user;
    };

    $grants = ['products.access', 'products.show', 'products.create', 'products.edit', 'products.delete',
        'products.get.product', 'products-in.access', 'products-in.create', 'products-in.report',
        'products-out.access', 'products-out.create', 'products-out.report', 'dropdown.products',
        'dropdown.product.categories', 'dropdown.unit.types', 'dropdown.vendors', 'dropdown.staffs',
        'dropdown.expense.types', 'dropdown.funds', 'dropdown.clients', 'dropdown.product.serial', 'dropdown.product.in', 'staff.pagination.length'];
    foreach ($grants as $permission) Permission::findOrCreate($permission, 'sanctum');
    $full = $makeUser($company, 'prd_cp', 'Product Full', $grants);
    $foreign = $makeUser($other, 'prd_mk', 'Product Full', $grants);
    $reader = $makeUser($company, 'prd_reader', 'Product Reader', ['products.access', 'products.show']);
    $denied = $makeUser($company, 'prd_denied', 'Product Denied');
    $outOnly = $makeUser($company, 'prd_out_reader', 'Product Out Reader', ['products-out.report', 'dropdown.products']);
    $accounts = [];
    foreach ([$full, $foreign, $reader, $denied, $outOnly] as $user) {
        $accounts[$user->username] = ['uuid' => $user->uuid, 'host' => $user->company->domain];
    }
    $fixtures = [];
    foreach ([$full, $foreign] as $user) {
        Auth::login($user);
        Landlord::addTenant('company_id', $user->company_id);
        setPermissionsTeamId($user->company_id);
        $unit = UnitType::create(['name' => 'Product Test Pieces', 'sid' => 1, 'deletable' => 0]);
        $altUnit = UnitType::create(['name' => 'Product Test Meters', 'sid' => 2, 'deletable' => 0]);
        $altCategory = ProductCategory::create(['name' => 'Product Test Cable', 'sid' => 2, 'deletable' => 0]);
        $category = ProductCategory::create(['name' => 'Product Test Hardware', 'sid' => 1, 'deletable' => 0]);
        $staff = Staff::create(['staffId' => 'PRD-'.$user->id, 'user_id' => $user->id, 'name' => 'Product Test Staff',
            'phone' => '01700000000', 'status' => 'active', 'designation' => 'admin']);
        $user->update(['staff_id' => $staff->id]);
        $expense = ExpenseType::create(['name' => 'Product Test Purchase']);
        $vendor = Vendor::factory()->create(['company_id' => $user->company_id, 'name' => 'Product Test Vendor']);
        $client = Client::withoutEvents(fn () => Client::factory()->create(['company_id' => $user->company_id, 'reseller_id' => null, 'name' => 'Product Test Client', 'pppoe_username' => 'prd-client-'.$user->id]));
        $altUser = User::factory()->create(['company_id' => $user->company_id, 'username' => 'prd_entry_'.$user->id, 'password' => $password, 'status' => 1]);
        $altStaff = Staff::create(['staffId' => 'PRD-ALT-'.$user->id, 'user_id' => $altUser->id, 'name' => 'Product Test Other Staff', 'phone' => '01700000001', 'status' => 'active', 'designation' => 'admin']);
        $altVendor = Vendor::factory()->create(['company_id' => $user->company_id, 'name' => 'Product Test Other Vendor']);
        $altClient = Client::withoutEvents(fn () => Client::factory()->create(['company_id' => $user->company_id, 'reseller_id' => null, 'name' => 'Product Test Other Client', 'pppoe_username' => 'prd-client-other-'.$user->id]));
        $products = [];
        for ($i = 1; $i <= 14; $i++) {
            $product = Product::create(['name' => $user->username.' stock '.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                'has_serial' => $i === 1 ? 1 : 0, 'unit_type_id' => $i === 2 ? $altUnit->id : $unit->id, 'product_category_id' => $i === 2 ? $altCategory->id : $category->id,
                'description' => 'product fixture '.$i, 'vat' => 0]);
            if ($i <= 2) {
                $stock = ProductIn::create(['product_id' => $product->id, 'quantity' => 10, 'quantity_remaining' => 10,
                    'purchase_date' => '2026-11-01', 'voucher' => 'PRD-'.$user->id.'-'.$i,
                    'status' => $i === 1 ? 'new' : 'old', 'brand' => 'Fixture', 'unit_price' => 100, 'unit_sell_price' => 150,
                    'total_price' => 1000, 'unit_type' => $unit->name, 'staff_id' => $i === 1 ? $user->id : $altUser->id,
                    'purchase_by' => $i === 1 ? $staff->id : $altStaff->id, 'vendor_id' => $i === 1 ? $vendor->id : $altVendor->id, 'expense_type_id' => $expense->id]);
                if ($i === 1) for ($j = 1; $j <= 10; $j++) ProductSerial::create([
                    'product_id' => $product->id, 'productin_id' => $stock->id, 'serial_number' => 'PRD-'.$user->id.'-'.$j]);
                $issued = ProductOut::create(['product_id' => $product->id, 'productin_id' => $stock->id,
                    'quantity' => $i === 1 ? 1 : 3, 'out_date' => '2026-11-05', 'purchase_date' => '2026-11-01',
                    'voucher' => $stock->voucher, 'status' => $stock->status, 'brand' => 'Fixture',
                    'unit_price' => 150, 'unit_sell_price' => 150, 'total_price' => $i === 1 ? 150 : 450, 'unit_type' => $unit->name,
                    'staff_id' => $i === 1 ? $staff->id : $altStaff->id, 'received_by' => $i === 1 ? $staff->id : $altStaff->id,
                    'vendor_id' => $i === 1 ? $vendor->id : $altVendor->id, 'client_id' => $i === 1 ? $client->id : $altClient->id]);
                $stock->update(['quantity_remaining' => $i === 1 ? 9 : 7]);
                if ($i === 1) ProductSerial::where('productin_id', $stock->id)->where('serial_number', 'PRD-'.$user->id.'-1')->update(['productout_id' => $issued->id]);
                $products[] = ['uuid' => $product->uuid, 'id' => $product->id, 'name' => $product->name, 'stock' => $stock->id];
            }
        }
        $fixtures[$user->username] = ['unit' => $unit->id, 'category' => $category->id, 'staff' => $staff->id,
            'expense' => $expense->id, 'vendor' => $vendor->id, 'client' => $client->id, 'altUnit' => $altUnit->id, 'altCategory' => $altCategory->id, 'otherStaff' => $altStaff->id, 'otherVendor' => $altVendor->id, 'otherClient' => $altClient->id, 'products' => $products];
    }
    Auth::logout();
    Landlord::removeTenant('company_id');
    $send = static function (array $message): void {
        fwrite(STDOUT, json_encode($message, JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR)."\n");
        fflush(STDOUT);
    };
    $send(['fixture' => ['accounts' => $accounts, 'data' => $fixtures]]);
    $queuedInvoices = [];
    $fixture = app();
    $connection = DB::connection();
    while (($line = fgets(STDIN)) !== false) {
        $message = json_decode($line, true, flags: JSON_THROW_ON_ERROR);
        if (str_starts_with($message['url'], '/api/__products/state') && ($message['headers']['x-product-fixture'] ?? null) === $password) {
            $state = [];
            foreach (['products', 'product_ins', 'product_outs', 'product_serials', 'expense'] as $table) {
                $state[$table === 'expense' ? 'expenses' : $table] = DB::table($table)->orderBy('id')->get()->toArray();
            }
            $state['queuedInvoices'] = $queuedInvoices;
            $send(['id' => $message['id'], 'status' => 200, 'headers' => ['Content-Type' => 'application/json'], 'body' => base64_encode(json_encode($state, JSON_THROW_ON_ERROR))]);
            continue;
        }
        // Each HTTP request boots a fresh Laravel application and model scopes.
        // The test connection is the only application state shared across requests.
        Model::clearBootedModels();
        $web = require getenv('PRD_E2E_BACKEND').'/bootstrap/app.php';
        $web->useStoragePath($storage);
        $web->afterResolving('db', fn (DatabaseManager $db) => $db->extend('sqlite', fn () => $connection));
        $web->make(ConsoleKernel::class)->bootstrap();
        Queue::fake();
        Notification::fake();
        Http::fake();
        Storage::fake('local');
        $kernel = $web->make(Kernel::class);

        $server = ['HTTP_ACCEPT' => 'application/json', 'REMOTE_ADDR' => '127.0.0.1'];
        foreach ($message['headers'] as $name => $value) {
            $key = strtoupper(str_replace('-', '_', $name));
            $server[$key === 'CONTENT_TYPE' ? $key : 'HTTP_'.$key] = $value;
        }
        $request = Request::create($message['url'], $message['method'], server: $server, content: base64_decode($message['body'], true));
        $response = $kernel->handle($request);
        foreach (Queue::pushed(\App\Jobs\ProductInvoiceJob::class) as $job) {
            $queuedInvoices[] = (new \ReflectionProperty($job, 'invoiceData'))->getValue($job);
        }
        $content = $response->getContent();
        $send([
            'id' => $message['id'],
            'status' => $response->getStatusCode(),
            'headers' => $response->headers->allPreserveCaseWithoutCookies(),
            'body' => is_string($content) ? base64_encode($content) : '',
        ]);
        $kernel->terminate($request, $response);
        Facade::clearResolvedInstances();
        $web->flush();
        Container::setInstance($fixture);
        Facade::setFacadeApplication($fixture);
        Model::setConnectionResolver($fixture->make('db'));
        Model::setEventDispatcher($fixture->make('events'));
        unset($request, $response, $kernel, $web, $content);
        gc_collect_cycles();
    }

    Container::setInstance($fixture);
    Facade::clearResolvedInstances();
    Facade::setFacadeApplication($fixture);
    Model::setConnectionResolver($fixture->make('db'));
    Model::setEventDispatcher($fixture->make('events'));
});
