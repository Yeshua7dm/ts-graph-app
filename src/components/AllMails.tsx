import { AuthenticatedTemplate } from "@azure/msal-react";
import { Message } from "microsoft-graph";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import {
  // NavLink as RouterNavLink,
  RouteComponentProps,
} from "react-router-dom";
import { useAppContext } from "../AppContext";
import { getUnreadMails } from "../GraphService";
import "../styles/Calendar.css";

export default function AllMails(props: RouteComponentProps) {
  const app = useAppContext();

  const [unreadMails, setUnreadMails] = useState<Message[]>([]);
  const [readMails, setReadMails] = useState<Message[]>([]);
  const [selectedMail, setSelectedMail] = useState<Message>();
  const [mailBody, setMailBody] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [allRead, setAllRead] = useState(0);

  useEffect(() => {
    const loadMails = async () => {
      if (app.user && unreadMails.length < 1) {
        try {
          const unreadMails = await getUnreadMails(app.authProvider!);
          setUnreadMails(unreadMails);
        } catch (err: any) {
          app.displayError!(err.message);
        }
      }
    };

    loadMails();
  });

  // return (
  //   <AuthenticatedTemplate>
  //     <div className="mb-3">
  //       <h1 className="mb-3">Last 10 Unread Mails</h1>

  //     </div>
  //   </AuthenticatedTemplate>
  // );

  return (
    <AuthenticatedTemplate>
      <pre>
        <code>{JSON.stringify(unreadMails, null, 2)}</code>
      </pre>
    </AuthenticatedTemplate>
  );
}
