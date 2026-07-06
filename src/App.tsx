import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppProvider } from "./context/AppContext"
import { Suspense, lazy } from "react"
import { ErrorBoundary } from "./components/ErrorBoundary"


const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })))
const Analyze = lazy(() => import("./pages/Analyze").then(m => ({ default: m.Analyze })))
const AnalysisDetail = lazy(() => import("./pages/AnalysisDetail").then(m => ({ default: m.AnalysisDetail })))
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })))

function RouteLoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-violet-400 border-transparent animate-spin" />
            </div>
        </div>
    )
}

function App() {
    return (
        <AppProvider>
            <BrowserRouter>

                <ErrorBoundary section="this page">

                    <Suspense fallback={<RouteLoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/analyze" element={<Analyze />} />
                            <Route path="/analysis/:id" element={<AnalysisDetail />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>

                </ErrorBoundary>
            </BrowserRouter>
        </AppProvider>
    )
}

export default App