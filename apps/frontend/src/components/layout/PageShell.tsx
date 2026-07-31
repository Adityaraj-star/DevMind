import { cn } from "../../lib/utils"
import { useAppContext } from "../../context/AppContext"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"

interface PageShellProps {
    children: React.ReactNode  // whatever the page puts between the tags
    className?: string
}

export function PageShell({ children, className }: PageShellProps) {
    const { state } = useAppContext()   // to know current Sidebar state

    return (
        <div className="min-h-screen bg-(--zinc-950) text-[var(--zinc-100)]">
            <Navbar />
            <Sidebar />

            <main
                className={cn(
                    "pt-14", 
                    "transition-[margin-left] duration-300 ease-in-out",
                    state.sidebarOpen ? "md:ml-72" : "ml-0",
                    className
                )}
            >
                {children}
            </main>
        </div>
    )
}