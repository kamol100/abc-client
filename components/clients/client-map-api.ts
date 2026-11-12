export type AddClientMapPayload = {
    adr_latitude: number;
    adr_longitude: number;
};

export function addClientMapUrl(clientId: string): string {
    return `/clients/${clientId}/add-client-map`;
}
