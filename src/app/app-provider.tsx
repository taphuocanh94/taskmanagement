'use client'


import getLoggedUser from "@/actions/get-logged-user";
import getTranslations from "@/actions/get-translations";
import type { TLoggedUser, TWorkspacesMapWithKeyById } from "@/types/prisma"
import { usePathname } from "next/navigation";
import { ActionDispatch, createContext, Suspense, useContext, useEffect, useReducer } from "react"
import Loading from "./loading";

// idle: chưa xác định (lúc mới load app)
// loading: đang xác minh token
// unauthenticated: chưa đăng nhập
// authenticated: đã đăng nhập
type AuthStatus = 'unauthenticated' | 'authenticated'; // | 'idle' | 'loading';

export type AppContextBaseStateType = {
    authStatus: AuthStatus;
    appLoading: boolean;
    languageCode: string;
    translationsLoading: boolean;
    translations: Record<string, string>;
}

export type AppLoggedInStateType = AppContextBaseStateType & {
    authStatus: 'authenticated';
    user: TLoggedUser;
    workspaces: TWorkspacesMapWithKeyById;
}

export type AppNotLoggedInStateType = AppContextBaseStateType & {
    authStatus: 'unauthenticated'; // | 'idle' | 'loading';
}


export type AppContextStateType = AppLoggedInStateType | AppNotLoggedInStateType


let defaultAppContextState: AppContextStateType = {
    authStatus: 'unauthenticated',
    appLoading: true,
    languageCode: "vi",
    translationsLoading: true,
    translations: {}
}


export type AppContextType = {
    appStates: AppContextStateType;
    setAppStates: ActionDispatch<[action: AppSetStatesAction]>;
}

export const AppContext = createContext<AppContextType>({
    appStates: defaultAppContextState,
    setAppStates: () => { },
})

type AppSetStatesAction =
    | { type: 'LOADING', payload: boolean }
    | { type: 'LOGIN_SUCCESS'; payload: AppLoggedInStateType['user'] }
    | { type: 'LOGOUT' }
    | { type: 'LOGIN_FAILED' }
    | { type: 'SET_LOCALE'; payload: AppContextBaseStateType["languageCode"] }
    | { type: 'SET_TRANSLATION'; payload: AppContextBaseStateType['translations'] }
    | { type: 'SET_WORKSPACES'; payload: AppLoggedInStateType['workspaces'] };


export default function AppProvider({
    children,
    translations,
    loggedUser
}: {
    children: React.ReactNode
    translations: AppContextBaseStateType['translations']
    loggedUser: AppLoggedInStateType['user'] | null
}) {
    // const [appStates, setAppStates] = useState<AppContextStateType>(defaultAppContextState);
    if (!loggedUser) {
        defaultAppContextState = {
            ...defaultAppContextState,
            translations,
            authStatus: 'unauthenticated'
        }
    } else {
        defaultAppContextState = {
            ...defaultAppContextState,
            translations,
            authStatus: 'authenticated',
            user: loggedUser,
            workspaces: {}
        }
    }
    const [appStates, setAppStates] = useReducer(function (prevState: AppContextStateType, action: AppSetStatesAction) {
        const state = prevState
        console.log(action.type)
        if (action.type == 'LOGIN_SUCCESS') {
            if (prevState.authStatus !== 'authenticated')
                return { ...prevState, authStatus: 'authenticated' as const, user: action.payload, workspaces: {} };
        } else if (action.type == 'SET_TRANSLATION') {
            return { ...prevState, translations: action.payload };
        } else if (action.type == 'LOGOUT') {
            return {
                ...prevState,
                user: undefined,
                workspaces: undefined,
                authStatus: 'unauthenticated' as const,
            };
        } else if (action.type == 'SET_WORKSPACES') {
            return {
                ...prevState,
                workspaces: action.payload,
            };
        } else if (action.type == 'LOADING') {
            return {
                ...prevState,
                appLoading: action.payload,
            };
        }
        return state
    }, defaultAppContextState)

    const pathname = usePathname()
    useEffect(() => {
        setAppStates({ type: 'LOADING' as const, payload: true })
        const fetchLoggedInState = async () => {
            try {
                //Kiểm tra xem người dùng đã đăng nhập hay chưa
                const loggedUser = await getLoggedUser();
                if (!loggedUser) {
                    setAppStates({ type: 'LOGOUT' as const })
                } else {
                    console.log('app-provider', loggedUser)
                    if (appStates.authStatus === 'unauthenticated') {
                        setAppStates({ type: 'LOGIN_SUCCESS' as const, payload: loggedUser })
                    }
                }
            } catch (error) {
                console.error('Failed to check logged in state:', error);
            }
        };

        fetchLoggedInState();
    }, [pathname]);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                //Load dữ liệu ngôn ngữ từ server action getTranslations
                const data = await getTranslations(appStates.languageCode);

                //Cập nhật trạng thái ngôn ngữ
                setAppStates({ type: 'SET_TRANSLATION', payload: data })
            } catch (error) {
                console.error('Failed to fetch translations:', error);
            }
        };

        fetchTranslations();
    }, [appStates.languageCode]); // Chỉ chạy lại khi languageCode thay đổi

    return <Suspense fallback={<Loading />}>
        <AppContext.Provider value={{ appStates, setAppStates }}>
        {children}
    </AppContext.Provider>
    </Suspense>
}


// Custom hook
export const useAppContext = () => useContext(AppContext);
export const useAuthenticatedAppContext = () => useContext(AppContext) as AppContextType & { appStates: AppLoggedInStateType };

const useTranslate = (key: string) => {
    const { appStates: { translations } } = useAppContext();

    return translations[key] ? translations[key] : key
}

export const translate = useTranslate 