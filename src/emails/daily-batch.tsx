import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
} from "@react-email/components";

interface DomainChange {
  domain: string;
  oldDA: number;
  newDA: number;
  change: number;
}

interface DailyBatchProps {
  domains: DomainChange[];
  totalChanges: number;
  positiveChanges: number;
  negativeChanges: number;
  timestamp: string;
}

export const DailyBatch = ({
  domains,
  totalChanges,
  positiveChanges,
  negativeChanges,
  timestamp,
}: DailyBatchProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Daily Domain Authority Update</Heading>
            <Text style={summaryText}>
              {totalChanges} domain{totalChanges !== 1 ? "s" : ""} updated today
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={statsSection}>
            <Row>
              <Column style={statColumn}>
                <Text style={statNumber}>{totalChanges}</Text>
                <Text style={statLabel}>Total Changes</Text>
              </Column>
              <Column style={statColumn}>
                <Text style={{ ...statNumber, color: "#10b981" }}>
                  {positiveChanges}
                </Text>
                <Text style={statLabel}>Improvements</Text>
              </Column>
              <Column style={statColumn}>
                <Text style={{ ...statNumber, color: "#ef4444" }}>
                  {negativeChanges}
                </Text>
                <Text style={statLabel}>Declines</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={contentSection}>
            <Heading style={h2}>Domain Changes</Heading>

            {domains.map((domain, index) => (
              <div key={index} style={domainRow}>
                <div style={domainInfo}>
                  <Text style={domainName}>{domain.domain}</Text>
                  <Text style={daChange}>
                    {domain.oldDA} → {domain.newDA}
                  </Text>
                </div>
                <div style={changeIndicator}>
                  <Text
                    style={{
                      ...changeValue,
                      color:
                        domain.change > 0
                          ? "#10b981"
                          : domain.change < 0
                            ? "#ef4444"
                            : "#6b7280",
                    }}
                  >
                    {domain.change > 0 ? "+" : ""}
                    {domain.change}
                  </Text>
                </div>
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This is your daily summary of domain authority changes. Check your
              dashboard for detailed analytics and trends.
            </Text>
            <Text style={timestampText}>
              Report generated: {new Date(timestamp).toLocaleString()}
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

const summaryText = {
  color: "#8898aa",
  fontSize: "16px",
  fontWeight: "normal",
  margin: "8px 0",
  padding: "0",
};

const statsSection = {
  padding: "24px",
  backgroundColor: "#f8f9fa",
};

const statColumn = {
  textAlign: "center" as const,
  padding: "0 12px",
};

const statNumber = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#333",
  margin: "0 0 4px 0",
  padding: "0",
};

const statLabel = {
  fontSize: "14px",
  color: "#8898aa",
  margin: "0",
  padding: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
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

const domainRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  margin: "8px 0",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
};

const domainInfo = {
  flex: 1,
};

const domainName = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
  padding: "0",
};

const daChange = {
  color: "#8898aa",
  fontSize: "14px",
  margin: "0",
  padding: "0",
};

const changeIndicator = {
  textAlign: "right" as const,
};

const changeValue = {
  fontSize: "18px",
  fontWeight: "bold",
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

export default DailyBatch;
