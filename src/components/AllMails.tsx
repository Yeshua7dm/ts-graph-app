import { AuthenticatedTemplate } from "@azure/msal-react";
import { Message } from "microsoft-graph";
import { useEffect, useState } from "react";
import { Spinner, Tab, Tabs, Modal, Button } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { useAppContext } from "../AppContext";
import { getUnreadMails, updateMail } from "../GraphService";
import "../styles/Calendar.css";
import SingleMail from "./SingleMail";

export default function AllMails(props: RouteComponentProps) {
  const app = useAppContext();

  const [unreadMails, setUnreadMails] = useState<Message[]>([]);
  const [readMails, setReadMails] = useState<Message[]>([]);
  const [selectedMail, setSelectedMail] = useState<Message>();
  const [mailBody, setMailBody] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const loadMails = async () => {
      if (app.user && unreadMails.length < 5) {
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

  const onReadMail = (id: string) => {
    const mailSelected = unreadMails.filter((mail) => mail.id === id).pop();

    setSelectedMail(mailSelected);
    const mailBody = mailSelected.body.content
      .replace(/<!--/g, "")
      .replace(/-->/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    setMailBody(mailBody);
    setShow(true);
  };

  const updateMailStatus = async (mailId: string) => {
    try {
      var mailResponse = await updateMail(app.authProvider!, mailId);
      setSelectedMail(mailResponse);
    } catch (err: any) {
      app.displayError!(err.message);
    }
    if (mailResponse) {
      // remove selected mail from unread mails
      setUnreadMails(unreadMails.filter((mail) => mail.id !== mailId));
      // add selected mail to read mails
      setReadMails([mailResponse, ...readMails]);
    }
  };

  return (
    <AuthenticatedTemplate>
      <Tabs
        className="mb-3"
        id="controlled-tab-example"
        defaultActiveKey="mailsToRead"
      >
        <Tab
          eventKey="mailsToRead"
          title={
            unreadMails.length >= 5
              ? `Last ${unreadMails.length} Unread Mails`
              : "Loading Unread Mails"
          }
        >
          {unreadMails.length < 5 ? (
            <>
              <Spinner animation="grow" variant="success" />{" "}
              <Spinner animation="grow" variant="success" />{" "}
              <Spinner animation="grow" variant="success" />{" "}
              <Spinner animation="grow" variant="success" />{" "}
              <Spinner animation="grow" variant="success" />{" "}
            </>
          ) : (
            unreadMails.map((mail) => (
              <SingleMail
                key={mail.id}
                isRead={mail.isRead}
                subject={mail.subject}
                bodyPreview={mail.bodyPreview}
                senderAddress={mail.sender.emailAddress.address}
                senderName={mail.sender.emailAddress.name}
                readMail={onReadMail}
                mailId={mail.id}
              />
            ))
          )}
        </Tab>
        {readMails.length > 0 && (
          <Tab eventKey="readMails" title={`Read Mails (${readMails.length})`}>
            {readMails.map((mail) => (
              <SingleMail
                key={mail.id}
                isRead={mail.isRead}
                subject={mail.subject}
                bodyPreview={mail.bodyPreview}
                senderAddress={mail.sender.emailAddress.address}
                senderName={mail.sender.emailAddress.name}
                readMail={() => {
                  console.log("nothing");
                }}
                mailId={mail.id}
              />
            ))}
          </Tab>
        )}
      </Tabs>
      {/* <pre>
        <code>{JSON.stringify(unreadMails, null, 2)}</code>
      </pre> */}

      <Modal
        show={show}
        // fullscreen={true}
        backdrop="static"
        keyboard={false}
        size="xl"
      >
        <Modal.Body>
          {<div dangerouslySetInnerHTML={{ __html: mailBody }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              updateMailStatus(selectedMail.id);
              setShow(false);
            }}
          >
            Mark as Read
          </Button>
        </Modal.Footer>
      </Modal>
    </AuthenticatedTemplate>
  );
}
