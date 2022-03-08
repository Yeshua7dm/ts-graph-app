import { Client, GraphRequestOptions, PageCollection, PageIterator } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { endOfWeek, startOfWeek } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { User, Event, Message } from 'microsoft-graph';

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
// calendar services here
export async function getUserWeekCalendar(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
    timeZone: string): Promise<Event[]> {
    ensureClient(authProvider);

    // Generate startDateTime and endDateTime query params
    // to display a 7-day window
    const now = new Date();
    const startDateTime = zonedTimeToUtc(startOfWeek(now), timeZone).toISOString();
    const endDateTime = zonedTimeToUtc(endOfWeek(now), timeZone).toISOString();

    // GET /me/calendarview?startDateTime=''&endDateTime=''
    // &$select=subject,organizer,start,end
    // &$orderby=start/dateTime
    // &$top=50
    var response: PageCollection = await graphClient!
        .api('/me/calendarview')
        .header('Prefer', `outlook.timezone="${timeZone}"`)
        .query({ startDateTime: startDateTime, endDateTime: endDateTime })
        .select('subject,organizer,start,end')
        .orderby('start/dateTime')
        .top(25)
        .get();

    if (response["@odata.nextLink"]) {
        // Presence of the nextLink property indicates more results are available
        // Use a page iterator to get all results
        var events: Event[] = [];

        // Must include the time zone header in page
        // requests too
        var options: GraphRequestOptions = {
            headers: { 'Prefer': `outlook.timezone="${timeZone}"` }
        };

        var pageIterator = new PageIterator(graphClient!, response, (event) => {
            events.push(event);
            return true;
        }, options);

        await pageIterator.iterate();

        return events;
    } else {

        return response.value;
    }
}
// TODO: this is where the functions to get emails
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
// TODO: this is where update emails too will be placed