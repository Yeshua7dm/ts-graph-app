import { Card, Button } from "react-bootstrap";
interface SingleMailProps {
  isRead: boolean;
  subject: string;
  bodyPreview: string;
  senderAddress: string;
  senderName: string;
  mailId: string;
  readMail?: any;
}

const SingleMail = ({
  isRead,
  subject,
  bodyPreview,
  senderAddress,
  senderName,
  mailId,
  readMail,
}: SingleMailProps) => {
  return (
    <Card
      bg="light"
      text="dark"
      className="mb-2 mx-auto"
    >
      <Card.Header className="text-right">
        <p>
          Sent From: <a href={`mailto:${senderAddress}`}>{senderName}</a>
        </p>
      </Card.Header>
      <Card.Body>
        <Card.Title>{subject}</Card.Title>
        <Card.Text>{bodyPreview}</Card.Text>
      </Card.Body>
      <Card.Footer className="text-right">
        {!isRead ? (
          <Button
            variant="primary"
            onClick={() => {
              readMail(mailId);
            }}
          >
            Read Mail
          </Button>
        ) : (
          <Button variant="secondary" disabled>
            Mail has been read
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
};

export default SingleMail;
