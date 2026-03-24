import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-6 font-mono">
      <div className="border-2 border-stone-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
        
        <div className="bg-stone-900 text-amber-400 px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            System_Auth_Required // v4.02.1
          </span>
        </div>

        <div className="p-8">
          <SignIn 
            fallbackRedirectUrl="/Dashboard"  // ✅ use fallback, not force
            signUpUrl="/Login"                // ✅ keep sign-up on same page
            appearance={{
              variables: {
                colorPrimary: "#1c1917",
                colorText: "#1c1917",
                colorBackground: "#ffffff",
                borderRadius: "0px",
                fontFamily: "monospace",
              },
              elements: {
                card: "shadow-none border-0 p-0",
                socialButtonsBlock: "hidden",  // hides social login buttons
                dividerRow: "hidden",          // hides the "or" divider
                headerTitle: "text-xs uppercase font-black tracking-widest",
                headerSubtitle: "text-[10px] uppercase font-bold text-stone-400",
                socialButtonsBlockButton: "border-2 border-stone-900 rounded-none hover:bg-stone-50",
                formButtonPrimary: "bg-stone-900 hover:bg-stone-800 rounded-none text-[10px] uppercase tracking-widest py-3",
                formFieldInput: "border-2 border-stone-200 focus:border-stone-900 rounded-none transition-all",
                footerActionText: "text-[10px] uppercase font-bold",
                footerActionLink: "text-amber-600 hover:text-amber-700",
              }
            }}
          />
        </div>
        
        <div className="bg-stone-50 border-t border-stone-200 p-4">
          <p className="text-[9px] text-stone-400 leading-tight uppercase font-bold italic text-center">
            Security Warning: All access attempts are recorded via US-EAST-1 Node.
          </p>
        </div>
      </div>
    </div>
  );
}