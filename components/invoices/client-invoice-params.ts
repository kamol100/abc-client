export function clientInvoiceQueryParams(
    clientId: string,
    filterValue: string | null,
): Record<string, string> {
    const queryParams: Record<string, string> = filterValue
        ? (Object.fromEntries(new URLSearchParams(filterValue)) as Record<string, string>)
        : {};

    if (queryParams.track_id && !queryParams.trackID) {
        queryParams.trackID = queryParams.track_id;
    }

    delete queryParams.client_id;

    return {
        ...queryParams,
        client_uuid: clientId,
    };
}
