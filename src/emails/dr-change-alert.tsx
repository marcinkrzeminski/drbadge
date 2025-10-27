import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";

interface DRChangeAlertProps {
  domain: string;
  oldDA: number;
  newDA: number;
  change: number;
  changeDirection: "increased" | "decreased";
  timestamp: string;
}

export const DRChangeAlert = ({
  domain,
  oldDA,
  newDA,
  change,
  changeDirection,
  timestamp,
}: DRChangeAlertProps) => {
  const changeColor = changeDirection === "increased" ? "#10b981" : "#ef4444";
  const changeSymbol = changeDirection === "increased" ? "+" : "";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Domain Authority Change Alert</Heading>
            <Text style={alertText}>
              Important update for your monitored domain
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={contentSection}>
            <Heading style={h2}>Domain Update</Heading>

            <div style={domainInfo}>
              <Text style={label}>Domain:</Text>
              <Text style={value}>{domain}</Text>
            </div>

            <div style={daInfo}>
              <Text style={label}>Previous DA:</Text>
              <Text style={value}>{oldDA}</Text>
            </div>

            <div style={daInfo}>
              <Text style={label}>Current DA:</Text>
              <Text style={value}>{newDA}</Text>
            </div>

            <div style={changeInfo}>
              <Text style={label}>Change:</Text>
              <Text
                style={{ ...value, color: changeColor, fontWeight: "bold" }}
              >
                {changeSymbol}
                {change} ({changeDirection})
              </Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This alert was triggered because your domain's DA changed by{" "}
              {Math.abs(change)} points.
            </Text>
            <Text style={timestampText}>
              Alert generated: {new Date(timestamp).toLocaleString()}
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
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
};

const alertText = {
  color: "#8898aa",
  fontSize: "16px",
  fontWeight: "normal",
  margin: "8px 0",
  padding: "0",
};

const contentSection = {
  padding: "24px",
};

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
};

const domainInfo = {
  margin: "16px 0",
};

const daInfo = {
  margin: "12px 0",
};

const changeInfo = {
  margin: "16px 0",
  padding: "16px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
};

const label = {
  color: "#8898aa",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
  padding: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const value = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "normal",
  margin: "0",
  padding: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerSection = {
  padding: "24px",
  backgroundColor: "#fff",
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
  padding: "0",
};

const timestampText = {
  color: "#8898aa",
  fontSize: "12px",
  margin: "16px 0 0 0",
  padding: "0",
};

export default DRChangeAlert;
