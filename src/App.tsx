import { Navbar } from './components/layout/Navbar'
import { Home } from "./pages/Home"
import { useTheme } from './hooks/useTheme'

function App() {
    const { theme, toggleTheme } = useTheme()
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar 
                theme={theme} 
                onToggleTheme={toggleTheme} 
            />
            <Home />
        </div>
    )
}

export default App