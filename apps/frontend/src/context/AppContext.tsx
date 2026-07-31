import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    type ReactNode,
} from "react"
import { appReducer, initialState } from "../lib/reducer"
import type { AppState, AppAction } from "../types"

type AppContextType = {
    state: AppState
    dispatch: React.Dispatch<AppAction>
}

// The context object — this is what gets broadcast and received
const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
    children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
    const [state, dispatch] = useReducer(appReducer, initialState)

    useEffect(() => {
        document.documentElement.classList.toggle("dark", state.theme === "dark")
    }, [state.theme])

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext(): AppContextType {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error(
            "useAppContext must be used inside <AppProvider>. " +
            "Make sure AppProvider wraps your component tree in App.tsx."
        )
    }
    return context
}