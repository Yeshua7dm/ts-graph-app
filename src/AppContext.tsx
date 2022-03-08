// use context for services that many components will use,
// the interfaces for instance are placed here

import React, {
  useContext,
  createContext,
  useState,
  MouseEventHandler,
  useEffect,
} from "react";

import config from "./Config";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { InteractionType, PublicClientApplication } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
// import the functions from graph service here
import { getUser } from "./GraphService";

export interface AppUser {
  displayName?: string;
  email?: string;
  avatar?: string;
  timeZone?: string;
  timeFormat?: string;
}

export interface AppError {
  message: string;
  debug?: string;
}

type AppContext = {
  user?: AppUser;
  error?: AppError;
  signIn?: MouseEventHandler<HTMLElement>;
  signOut?: MouseEventHandler<HTMLElement>;
  displayError?: Function;
  clearError?: Function;
  authProvider?: AuthCodeMSALBrowserAuthenticationProvider;
};

const appContext = createContext<AppContext>({
  user: undefined,
  error: undefined,
  signIn: undefined,
  signOut: undefined,
  displayError: undefined,
  clearError: undefined,
  authProvider: undefined,
});

export function useAppContext(): AppContext {
  return useContext(appContext);
}

interface ProvideAppContextProps {
  children: React.ReactNode;
}

export default function ProvideAppContext({
  children,
}: ProvideAppContextProps) {
  const auth = useProvideAppContext();
  return <appContext.Provider value={auth}>{children}</appContext.Provider>;
}

// function to provide app context
function useProvideAppContext() {
  // on load, check if there is a user, if none, display an error message
  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        try {
          // Check if user is already signed in
          const account = msal.instance.getActiveAccount();
          if (account) {
            // Get the user from Microsoft Graph
            const user = await getUser(authProvider);

            setUser({
              displayName: user.displayName || "",
              email: user.mail || user.userPrincipalName || "",
              timeFormat: user.mailboxSettings?.timeFormat || "h:mm a",
              timeZone: user.mailboxSettings?.timeZone || "UTC",
            });
          }
        } catch (err: any) {
          displayError(err.message);
        }
      }
    };
    checkUser();
  });

  const msal = useMsal();
  // the user is either undefined or AppUser type
  // undefined at start and on logout, AppUSer when logged in
  const [user, setUser] = useState<AppUser | undefined>(undefined);
  const [error, setError] = useState<AppError | undefined>(undefined);

  const displayError = (message: string, debug?: string) => {
    setError({ message, debug });
  };

  const clearError = () => {
    setError(undefined);
  };

  // const authProvider = undefined; replaced
  // Used by the Graph SDK to authenticate API calls
  const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
    msal.instance as PublicClientApplication,
    {
      account: msal.instance.getActiveAccount()!,
      scopes: config.scopes,
      interactionType: InteractionType.Popup,
    }
  );

  const signIn = async () => {
    await msal.instance.loginPopup({
      scopes: config.scopes,
      prompt: "select_account",
    });

    // TEMPORARY: Show the access token, stop this to proceed
    // displayError('Access token retrieved', result.accessToken);

    // Get the user from Microsoft Graph
    const user = await getUser(authProvider);

    setUser({
      displayName: user.displayName || "",
      email: user.mail || user.userPrincipalName || "",
      timeFormat: user.mailboxSettings?.timeFormat || "",
      timeZone: user.mailboxSettings?.timeZone || "UTC",
    });
  };

  const signOut = async () => {
    await msal.instance.logoutPopup();
    setUser(undefined);
  };

  return {
    user,
    error,
    signIn,
    signOut,
    displayError,
    clearError,
    authProvider,
  };
}
