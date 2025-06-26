import { AuthProvider } from "@/lib/auth"
import { AppWithAuth } from "@/components/app-with-auth"

export default function Page() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  )
}
