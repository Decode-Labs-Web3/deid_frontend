import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
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
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Terms of Service</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last updated: January 2024
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Introduction and Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to DEiD ("we," "our," or "us"), a decentralized identity
                platform built on blockchain technology. These Terms of Service
                ("Terms") govern your use of our platform, services, and any
                related applications (collectively, the "Service").
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by
                these Terms. If you disagree with any part of these terms, you
                may not access the Service.
              </p>
              <p>
                <strong>Important:</strong> Our Service involves blockchain
                technology, cryptocurrency, and decentralized systems. By using
                our Service, you acknowledge that you understand the risks
                associated with these technologies.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. User Accounts and Wallet Connections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To use our Service, you must connect a compatible cryptocurrency
                wallet (such as MetaMask, WalletConnect, or similar). You are
                responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Maintaining the security of your wallet and private keys
                </li>
                <li>
                  All transactions initiated through your connected wallet
                </li>
                <li>Ensuring your wallet is compatible with our Service</li>
                <li>Keeping your wallet software updated</li>
              </ul>
              <p>
                We do not store, have access to, or control your private keys,
                seed phrases, or wallet passwords. You are solely responsible
                for the security of your wallet and any losses that may occur.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. Blockchain Data and NFT Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our Service allows you to create, manage, and interact with
                decentralized identity data stored on blockchain networks. This
                includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Creating and managing decentralized identity profiles</li>
                <li>Minting and managing NFT badges and credentials</li>
                <li>
                  Storing identity data on IPFS (InterPlanetary File System)
                </li>
                <li>Interacting with smart contracts on blockchain networks</li>
              </ul>
              <p>
                <strong>Data Immutability:</strong> Once data is stored on the
                blockchain, it becomes immutable and cannot be deleted or
                modified. You acknowledge that any data you submit to the
                blockchain will be permanently recorded.
              </p>
              <p>
                <strong>Gas Fees:</strong> Blockchain transactions require gas
                fees paid in cryptocurrency. You are responsible for all gas
                fees associated with your transactions.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                4. User Responsibilities and Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You agree to use our Service only for lawful purposes and in
                accordance with these Terms. You agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws or regulations in your jurisdiction</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>
                  Transmit any malicious code, viruses, or harmful content
                </li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service to harass, abuse, or harm others</li>
                <li>Create false or misleading identity information</li>
                <li>Engage in any form of fraud or deception</li>
              </ul>
              <p>
                <strong>Compliance:</strong> You are responsible for ensuring
                your use of our Service complies with all applicable laws and
                regulations in your jurisdiction.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Service and its original content, features, and
                functionality are owned by DEiD and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
              <p>
                <strong>Your Content:</strong> You retain ownership of any
                content you create, upload, or submit through our Service.
                However, by using our Service, you grant us a limited license to
                use, display, and distribute your content as necessary to
                provide the Service.
              </p>
              <p>
                <strong>Open Source:</strong> Some components of our Service may
                be open source. Open source components are governed by their
                respective licenses, which may be different from these Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>DISCLAIMER:</strong> THE SERVICE IS PROVIDED "AS IS" AND
                "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                IMPLIED.
              </p>
              <p>
                To the maximum extent permitted by law, DEiD shall not be liable
                for any indirect, incidental, special, consequential, or
                punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of profits, data, or other intangible losses</li>
                <li>Blockchain network failures or congestion</li>
                <li>Smart contract bugs or vulnerabilities</li>
                <li>Loss of private keys or wallet access</li>
                <li>Cryptocurrency price fluctuations</li>
                <li>Regulatory changes affecting blockchain technology</li>
              </ul>
              <p>
                <strong>Blockchain Risks:</strong> You acknowledge that
                blockchain technology involves inherent risks, including but not
                limited to technical failures, network congestion, and potential
                loss of funds.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Privacy and Data Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our Service is designed with privacy in mind, but blockchain
                technology has unique privacy considerations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Blockchain data is publicly visible and immutable</li>
                <li>Wallet addresses may be linked to your identity</li>
                <li>IPFS data is distributed and may be cached globally</li>
                <li>Smart contract interactions are publicly recorded</li>
              </ul>
              <p>
                Please review our Privacy Policy for detailed information about
                how we collect, use, and protect your information.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Any disputes arising from these Terms or your use of the Service
                will be resolved through binding arbitration in accordance with
                the rules of the American Arbitration Association.
              </p>
              <p>
                <strong>Governing Law:</strong> These Terms are governed by and
                construed in accordance with the laws of the jurisdiction where
                DEiD is incorporated, without regard to conflict of law
                principles.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify users of any material changes by posting the updated
                Terms on our website and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the Service after any changes constitutes
                acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> decodenetwork.web3@gmail.com
                </p>
                <p>
                  <strong>Website:</strong> https://deid.network
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
