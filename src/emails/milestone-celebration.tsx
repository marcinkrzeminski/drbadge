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

interface MilestoneCelebrationProps {
  domain: string;
  milestone: string;
  achievement: string;
  timestamp: string;
}

export const MilestoneCelebration = ({
  domain,
  milestone,
  achievement,
  timestamp,
}: MilestoneCelebrationProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={celebrationHeader}>
            <Text style={celebrationEmoji}>🎉</Text>
            <Heading style={h1}>Congratulations!</Heading>
            <Text style={celebrationText}>You've reached a new milestone!</Text>
          </Section>

          <Hr style={hr} />

          <Section style={contentSection}>
            <div style={milestoneCard}>
              <Heading style={h2}>🏆 Milestone Achieved</Heading>

              <div style={achievementInfo}>
                <Text style={label}>Domain:</Text>
                <Text style={domainValue}>{domain}</Text>
              </div>

              <div style={achievementInfo}>
                <Text style={label}>Milestone:</Text>
                <Text style={milestoneValue}>{milestone}</Text>
              </div>

              <div style={achievementInfo}>
                <Text style={label}>Achievement:</Text>
                <Text style={achievementValue}>{achievement}</Text>
              </div>
            </div>

            <div style={messageCard}>
              <Text style={messageText}>
                🎊 Fantastic work! Your domain authority is growing strong. Keep
                up the excellent SEO efforts and continue monitoring your
                progress.
              </Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This milestone celebrates your hard work and dedication to
              improving your domain's authority. Check your dashboard to see
              your full progress and set new goals.
            </Text>
            <Text style={timestampText}>
              Celebrated: {new Date(timestamp).toLocaleString()}
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

const celebrationHeader = {
  padding: "32px 24px",
  textAlign: "center" as const,
  backgroundColor: "#fef3c7",
  borderRadius: "8px 8px 0 0",
};

const celebrationEmoji = {
  fontSize: "48px",
  margin: "0",
  padding: "0",
};

const h1 = {
  color: "#333",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
};

const celebrationText = {
  color: "#d97706",
  fontSize: "18px",
  fontWeight: "600",
  margin: "8px 0",
  padding: "0",
};

const contentSection = {
  padding: "24px",
};

const milestoneCard = {
  backgroundColor: "#f0f9ff",
  padding: "24px",
  borderRadius: "8px",
  margin: "16px 0",
  border: "2px solid #3b82f6",
};

const h2 = {
  color: "#1e40af",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
  padding: "0",
  textAlign: "center" as const,
};

const achievementInfo = {
  margin: "16px 0",
};

const label = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
  padding: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const domainValue = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const milestoneValue = {
  color: "#7c3aed",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
  padding: "0",
};

const achievementValue = {
  color: "#059669",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
  padding: "0",
};

const messageCard = {
  backgroundColor: "#f0fdf4",
  padding: "20px",
  borderRadius: "8px",
  margin: "16px 0",
  border: "1px solid #bbf7d0",
};

const messageText = {
  color: "#166534",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  padding: "0",
  textAlign: "center" as const,
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

export default MilestoneCelebration;
