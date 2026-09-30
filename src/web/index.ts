let client: CommandClient | null = null;

Bun.serve({
    routes: {
        "/": async () => {
            return new Response("Placeholder")
        },
        "/api/user": async () => {
            if (!client) return new Response("Not ready yet")
            return Response.json(client.user)
        }
    }
})

console.log("Webserver running")

export const setClient = (newClient: CommandClient) => {
    client = newClient;
}