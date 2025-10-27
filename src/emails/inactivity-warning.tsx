import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
} from "@react-email/components";

interface InactivityWarningProps {
  daysInactive: number;
  domainsCount: number;
  timestamp: string;
}

export const InactivityWarning = ({
  daysInactive,
  domainsCount,
  timestamp,
}: InactivityWarningProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>We Miss You! 👋</Heading>
            <Text style={warningText}>
              It's been a while since you checked your domain rankings
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={contentSection}>
            <div style={warningCard}>
              <Text style={warningMessage}>
                It's been <strong>{daysInactive} days</strong> since you last
                checked your domain rankings. You have{" "}
                <strong>
                  {domainsCount} domain{domainsCount !== 1 ? "s" : ""}
                </strong>{" "}
                being monitored.
              </Text>

              <Text style={reminderText}>
                Don't forget to check in on your domain authority progress! Your
                SEO efforts might need some attention.
              </Text>
            </div>

            <div style={actionCard}>
              <Text style={actionText}>
                📊 <strong>What you might have missed:</strong>
              </Text>
              <ul style={actionList}>
                <li style={actionItem}>Domain Authority changes</li>
                <li style={actionItem}>New ranking opportunities</li>
                <li style={actionItem}>Competitor movements</li>
                <li style={actionItem}>Backlink updates</li>
              </ul>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Regular monitoring helps you stay on top of your SEO performance.
              Log in to your dashboard to see the latest updates and insights.
            </Text>

            <div style={buttonContainer}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com"}/dashboard`}
                style={buttonStyle}
              >
                Check My Rankings
              </Button>
            </div>

            <Text style={timestampText}>
              Sent: {new Date(timestamp).toLocaleString()}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const headerSection = {
  padding: "24px",
  textAlign: "center" as const,
  backgroundColor: "#fef3c7",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
};

const warningText = {
  color: "#d97706",
  fontSize: "16px",
  fontWeight: "normal",
  margin: "8px 0",
  padding: "0",
};

const contentSection = {
  padding: "24px",
};

const warningCard = {
  backgroundColor: "#fef3c7",
  padding: "20px",
  borderRadius: "8px",
  margin: "16px 0",
  border: "1px solid #f59e0b",
};

const warningMessage = {
  color: "#92400e",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
  padding: "0",
};

const reminderText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  padding: "0",
};

const actionCard = {
  backgroundColor: "#f0f9ff",
  padding: "20px",
  borderRadius: "8px",
  margin: "16px 0",
  border: "1px solid #3b82f6",
};

const actionText = {
  color: "#1e40af",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
  padding: "0",
};

const actionList = {
  margin: "0",
  padding: "0 0 0 20px",
};

const actionItem = {
  color: "#3730a3",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "6px 0",
  padding: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerSection = {
  padding: "24px",
  backgroundColor: "#fff",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0 20px 0",
  padding: "0",
};

const buttonContainer = {
  margin: "20px 0",
};

const buttonStyle = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "bold",
  display: "inline-block",
};

const timestampText = {
  color: "#8898aa",
  fontSize: "12px",
  margin: "16px 0 0 0",
  padding: "0",
};

export default InactivityWarning;
