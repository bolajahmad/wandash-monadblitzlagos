import { AppLayout } from "@/components/layout/root-layout"
import HostWeb3Provider from "@/lib/context/host-web3-context"

export default function HostLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <HostWeb3Provider>
      <AppLayout>{children}</AppLayout>
    </HostWeb3Provider>
  )
}
