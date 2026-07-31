import { useNavigate } from "react-router-dom"
import { PageShell } from "../components/layout/PageShell"
import { Button } from "../components/ui/Button"

export function NotFound() {
    const navigate = useNavigate()

    return (
        <PageShell>
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">

                <p
                    className="font-mono text-[120px] font-bold text-[var(--zinc-800)] leading-none mb-6 select-none"
                    aria-hidden="true"
                >
                    404
                </p>

                <h1 className="text-2xl font-semibold text-(--zinc-200) mb-3">
                    Page not found
                </h1>

                <p className="text-(--zinc-500) text-sm max-w-md mb-8 leading-relaxed">
                    The page you're looking for doesn't exist. It may have been
                    moved, deleted, or you may have typed the URL incorrectly.
                </p>

                <div className="flex items-center gap-3">
                    <Button variant="primary" onClick={() => navigate("/")}>
                        Go home
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Go back
                    </Button>
                </div>
            </div>
        </PageShell>
    )
}