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

interface WeeklyRecapProps {
  totalDomains: number;
  averageDA: number;
  topPerformer: {
    domain: string;
    da: number;
    change: number;
  };
  biggestLoser: {
    domain: string;
    da: number;
    change: number;
  };
  weekStart: string;
  weekEnd: string;
  timestamp: string;
}

export const WeeklyRecap = ({
  totalDomains,
  averageDA,
  topPerformer,
  biggestLoser,
  weekStart,
  weekEnd,
  timestamp,
}: WeeklyRecapProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Weekly Domain Authority Recap</Heading>
            <Text style={periodText}>
              {new Date(weekStart).toLocaleDateString()} -{" "}
              {new Date(weekEnd).toLocaleDateString()}
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={statsSection}>
            <Row>
              <Column style={statColumn}>
                <Text style={statNumber}>{totalDomains}</Text>
                <Text style={statLabel}>Domains Monitored</Text>
              </Column>
              <Column style={statColumn}>
                <Text style={statNumber}>{averageDA.toFixed(1)}</Text>
                <Text style={statLabel}>Average DA</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={contentSection}>
            <Heading style={h2}>🏆 Top Performer</Heading>
            <div style={performerCard}>
              <Text style={performerDomain}>{topPerformer.domain}</Text>
              <Text style={performerStats}>
                Current DA: {topPerformer.da}
                <span style={{ color: "#10b981", fontWeight: "bold" }}>
                  {" "}
                  ({topPerformer.change > 0 ? "+" : ""}
                  {topPerformer.change})
                </span>
              </Text>
            </div>

            <Heading style={h2}>📉 Biggest Change</Heading>
            <div style={performerCard}>
              <Text style={performerDomain}>{biggestLoser.domain}</Text>
              <Text style={performerStats}>
                Current DA: {biggestLoser.da}
                <span
                  style={{
                    color:
                      biggestLoser.change < 0
                        ? "#ef4444"
                        : biggestLoser.change > 0
                          ? "#10b981"
                          : "#6b7280",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  ({biggestLoser.change > 0 ? "+" : ""}
                  {biggestLoser.change})
                </span>
              </Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={insightsSection}>
            <Heading style={h3}>💡 Insights</Heading>
            <ul style={insightsList}>
              <li style={insightItem}>
                Your portfolio maintains an average DA of {averageDA.toFixed(1)}{" "}
                across {totalDomains} domains
              </li>
              <li style={insightItem}>
                {topPerformer.domain} showed the strongest performance this week
              </li>
              <li style={insightItem}>
                Continue monitoring {biggestLoser.domain} for recovery
                opportunities
              </li>
            </ul>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This weekly recap helps you track your domain authority trends and
              make informed decisions. Visit your dashboard for detailed
              analytics and historical data.
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

const periodText = {
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
  margin: "24px 0 16px 0",
  padding: "0",
};

const performerCard = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "8px",
  margin: "12px 0",
  border: "1px solid #e6ebf1",
};

const performerDomain = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
  padding: "0",
};

const performerStats = {
  color: "#666",
  fontSize: "16px",
  margin: "0",
  padding: "0",
};

const insightsSection = {
  padding: "24px",
  backgroundColor: "#f0f9ff",
};

const h3 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
  padding: "0",
};

const insightsList = {
  margin: "0",
  padding: "0 0 0 20px",
};

const insightItem = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
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

export default WeeklyRecap;
