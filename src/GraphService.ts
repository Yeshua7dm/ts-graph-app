import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { User, Message } from 'microsoft-graph';

let graphClient: Client | undefined = undefined;

function ensureClient(authProvider: AuthCodeMSALBrowserAuthenticationProvider) {
    if (!graphClient) {
        graphClient = Client.initWithMiddleware({
            authProvider: authProvider
        });
    }

    return graphClient;
}

export async function getUser(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<User> {
    ensureClient(authProvider);

    // Return the /me API endpoint result as a User object
    const user: User = await graphClient!.api('/me')
        // Only retrieve the specific fields needed
        .select('displayName,mail,mailboxSettings,userPrincipalName')
        .get();

    return user;
}

// this is where the functions to get emails
export async function getUnreadMails(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<Message[]> {
    ensureClient(authProvider);

    const response: PageCollection = await graphClient!
        .api(`/me/mailFolders('Inbox')/messages`)
        .select('body,sender,isRead,subject,bodyPreview')
        .filter('isRead eq false')
        .top(10)
        .get();

    return response.value;
}
// this is where update emails too will be placed
export async function updateMail(authProvider: AuthCodeMSALBrowserAuthenticationProvider, id: string): Promise<Message> {
    ensureClient(authProvider);

    const message = {
        isRead: true
    }
    const response: Message = await graphClient!
        .api(`/me/messages/${id}`)
        .update(message);

    return response;
}