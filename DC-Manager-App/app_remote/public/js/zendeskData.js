export function fetchUserData(client) {
    client.get("currentUser").then(function(data) {
        const zendeskUserEmail = data.currentUser.email;
        const zendeskUserId = data.currentUser.id;
        const zendeskUsername = data.currentUser.name;
        document.querySelector("#zendesk-user-email").value = zendeskUserEmail;
        document.querySelector("#zendesk-user-id").value = zendeskUserId;
        document.querySelector("#zendesk-username").value = zendeskUsername;
    });
}

export function fetchTicketId(client) {
    client.get("ticket.id").then(function(data) {
        document.querySelector("#zendesk-ticket-id").value = data["ticket.id"];
    }).catch(function(error) {
        console.error("Error getting ticket ID:", error);
        notifyZendeskFailure(`Error getting ticket ID: ${error}`);
    });
}

export function notifyZendeskFailure(client, message) {
    client.invoke("notify", message, "error");
}
  