import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/setting">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last updated: January 2024
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  GDPR Compliant
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                1. Introduction and Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This Privacy Policy explains how DEiD ("we," "our," or "us")
                collects, uses, discloses, and protects your information when
                you use our decentralized identity platform and services.
              </p>
              <p>
                <strong>Important Note:</strong> Our platform is built on
                blockchain technology, which has unique privacy characteristics.
                Some information may be publicly visible on the blockchain and
                cannot be deleted or modified once recorded.
              </p>
              <p>
                By using our Service, you consent to the data practices
                described in this Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">
                2.1 Information You Provide Directly
              </h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Wallet Information:</strong> Your connected wallet
                  address and associated blockchain data
                </li>
                <li>
                  <strong>Identity Data:</strong> Username, display name, bio,
                  and avatar information
                </li>
                <li>
                  <strong>Social Accounts:</strong> Connected social media
                  accounts and verification data
                </li>
                <li>
                  <strong>Communication:</strong> Emails and messages sent to
                  our support team
                </li>
              </ul>

              <h4 className="font-semibold">
                2.2 Information Collected Automatically
              </h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Usage Data:</strong> How you interact with our
                  platform and services
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type,
                  device information
                </li>
                <li>
                  <strong>Blockchain Data:</strong> Public transaction data and
                  smart contract interactions
                </li>
                <li>
                  <strong>Cookies:</strong> Session cookies for authentication
                  and preferences
                </li>
              </ul>

              <h4 className="font-semibold">2.3 Blockchain-Specific Data</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Public Data:</strong> All blockchain transactions are
                  publicly visible
                </li>
                <li>
                  <strong>IPFS Data:</strong> Decentralized storage of identity
                  metadata
                </li>
                <li>
                  <strong>Smart Contract Data:</strong> Interactions with our
                  smart contracts
                </li>
                <li>
                  <strong>NFT Data:</strong> Badge and credential information
                  stored on-chain
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use your information for the following purposes:</p>

              <h4 className="font-semibold">3.1 Service Provision</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Creating and managing your decentralized identity profile
                </li>
                <li>
                  Facilitating blockchain transactions and smart contract
                  interactions
                </li>
                <li>Storing and retrieving identity data from IPFS</li>
                <li>Minting and managing NFT badges and credentials</li>
              </ul>

              <h4 className="font-semibold">3.2 Platform Operations</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining and improving our platform functionality</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Providing customer support and technical assistance</li>
                <li>Analyzing usage patterns to improve user experience</li>
              </ul>

              <h4 className="font-semibold">3.3 Legal Compliance</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Complying with applicable laws and regulations</li>
                <li>Responding to legal requests and court orders</li>
                <li>Protecting our rights and preventing abuse</li>
                <li>Enforcing our Terms of Service</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Blockchain Transparency and Immutability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  ⚠️ Important: Blockchain Data is Public and Immutable
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-2">
                  Once data is recorded on the blockchain, it becomes publicly
                  visible and cannot be deleted or modified. This is a
                  fundamental characteristic of blockchain technology.
                </p>
              </div>

              <h4 className="font-semibold">4.1 Public Blockchain Data</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>All transactions are publicly visible on the blockchain</li>
                <li>Wallet addresses and transaction amounts are recorded</li>
                <li>Smart contract interactions are permanently stored</li>
                <li>NFT metadata and ownership records are public</li>
              </ul>

              <h4 className="font-semibold">4.2 IPFS Data Distribution</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Identity data stored on IPFS is distributed globally</li>
                <li>IPFS content may be cached by multiple nodes</li>
                <li>Data may persist even if we remove it from our servers</li>
                <li>IPFS content is accessible via content hashes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may share your information in the following circumstances:
              </p>

              <h4 className="font-semibold">5.1 Public Blockchain Data</h4>
              <p>
                Information stored on the blockchain is inherently public and
                accessible to anyone. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Wallet addresses and transaction history</li>
                <li>Smart contract interactions and function calls</li>
                <li>NFT ownership and metadata</li>
                <li>Identity verification records</li>
              </ul>

              <h4 className="font-semibold">5.2 Service Providers</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Blockchain network providers (Ethereum, IPFS)</li>
                <li>Cloud hosting and infrastructure services</li>
                <li>Analytics and monitoring tools</li>
                <li>Customer support platforms</li>
              </ul>

              <h4 className="font-semibold">5.3 Legal Requirements</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Compliance with court orders and legal requests</li>
                <li>Cooperation with law enforcement investigations</li>
                <li>Protection of our rights and prevention of fraud</li>
                <li>Regulatory compliance and reporting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Data Security Measures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement various security measures to protect your
                information:
              </p>

              <h4 className="font-semibold">6.1 Technical Safeguards</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for sensitive data transmission</li>
                <li>Secure authentication and session management</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and permission management</li>
              </ul>

              <h4 className="font-semibold">6.2 Blockchain Security</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Smart contract security audits and testing</li>
                <li>Multi-signature wallets for critical operations</li>
                <li>
                  Decentralized storage to prevent single points of failure
                </li>
                <li>Immutable audit trails for all transactions</li>
              </ul>

              <h4 className="font-semibold">6.3 Operational Security</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Employee training on data protection practices</li>
                <li>Regular security updates and patch management</li>
                <li>Incident response and breach notification procedures</li>
                <li>Third-party security assessments</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Depending on your jurisdiction, you may have the following
                rights:
              </p>

              <h4 className="font-semibold">7.1 GDPR Rights (EU Residents)</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Right of Access:</strong> Request copies of your
                  personal data
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Correct inaccurate
                  personal data
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Request deletion of
                  personal data (limited by blockchain immutability)
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Limit how we
                  process your data
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Receive your data
                  in a structured format
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to certain types of
                  data processing
                </li>
              </ul>

              <h4 className="font-semibold">
                7.2 CCPA Rights (California Residents)
              </h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Right to Know:</strong> Information about data
                  collection and use
                </li>
                <li>
                  <strong>Right to Delete:</strong> Request deletion of personal
                  information
                </li>
                <li>
                  <strong>Right to Opt-Out:</strong> Opt out of the sale of
                  personal information
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> Equal service
                  regardless of privacy choices
                </li>
              </ul>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  ℹ️ Blockchain Limitations
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-2">
                  Due to the immutable nature of blockchain technology, some
                  rights (such as deletion) may be limited for data stored on
                  the blockchain.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use cookies and similar technologies to enhance your
                experience:
              </p>

              <h4 className="font-semibold">8.1 Types of Cookies</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic
                  platform functionality
                </li>
                <li>
                  <strong>Authentication Cookies:</strong> Maintain your login
                  session
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand
                  platform usage
                </li>
              </ul>

              <h4 className="font-semibold">8.2 Cookie Management</h4>
              <p>
                You can control cookies through your browser settings. However,
                disabling certain cookies may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Our platform integrates with various third-party services:</p>

              <h4 className="font-semibold">9.1 Blockchain Networks</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Ethereum:</strong> Smart contracts and NFT
                  functionality
                </li>
                <li>
                  <strong>IPFS:</strong> Decentralized file storage
                </li>
                <li>
                  <strong>Wallet Providers:</strong> MetaMask, WalletConnect,
                  etc.
                </li>
              </ul>

              <h4 className="font-semibold">9.2 Infrastructure Services</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloud hosting and content delivery networks</li>
                <li>Analytics and monitoring services</li>
                <li>Customer support and communication tools</li>
                <li>Security and fraud prevention services</li>
              </ul>

              <p>
                These third-party services have their own privacy policies. We
                encourage you to review them before using their services.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We retain your information for different periods depending on
                the type of data:
              </p>

              <h4 className="font-semibold">10.1 Blockchain Data</h4>
              <p>
                Data stored on the blockchain is permanent and cannot be
                deleted. This includes transaction records, smart contract
                interactions, and NFT ownership information.
              </p>

              <h4 className="font-semibold">10.2 Platform Data</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account Information:</strong> Retained while your
                  account is active
                </li>
                <li>
                  <strong>Support Communications:</strong> Retained for 3 years
                  for service improvement
                </li>
                <li>
                  <strong>Analytics Data:</strong> Aggregated and anonymized
                  data may be retained indefinitely
                </li>
                <li>
                  <strong>Legal Records:</strong> Retained as required by
                  applicable laws
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our platform operates globally and may transfer your information
                across international borders. We ensure appropriate safeguards
                are in place for such transfers, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Standard contractual clauses approved by relevant authorities
                </li>
                <li>
                  Adequacy decisions for countries with equivalent data
                  protection
                </li>
                <li>Your explicit consent for specific transfers</li>
                <li>Other appropriate safeguards as required by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>12. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our Service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>13. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the updated Privacy Policy on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices on our platform</li>
                <li>
                  Updating the "Last updated" date at the top of this policy
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>14. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> decodenetwork.web3@gmail.com
                </p>
                <p>
                  <strong>Website:</strong> https://deid.network
                </p>
                <p>
                  <strong>Data Protection Officer:</strong> privacy@deid.network
                </p>
              </div>

              <h4 className="font-semibold">EU Representative</h4>
              <p>
                For EU residents, you may also contact our EU representative for
                privacy-related matters at the above email addresses.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
