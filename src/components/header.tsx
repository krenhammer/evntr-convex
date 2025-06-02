"use client"

// import { GitHubIcon, UserButton } from "@daveyplate/better-auth-ui"
import { Link, useRouterState } from "@tanstack/react-router"
import { useAdminStatus, useSession, SignedIn, SignedOut, SignInButton, UserButton } from "@/auth/use-auth-hooks.convex"
import { ModeToggle } from "../components/mode-toggle"
import { Button } from "./ui/button"
import { BotIcon, Settings, Package, Check, AlertTriangle, ListChecks } from "lucide-react"
import { FaPencilRuler, FaRocket } from "react-icons/fa";
import { FaCalendar, FaChartGantt } from "react-icons/fa6";
import { IoMdChatbubbles } from "react-icons/io";
import { FiDatabase } from "react-icons/fi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { cn } from "@/lib/utils"
import { useSnapshot } from 'valtio'
import { OrganizationSwitcher } from './organizations/OrganizationSwitcher'


export function Header() {
    const { data: session } = useSession()
    const { isAdmin, isImpersonating } = useAdminStatus()
    const isEmailVerified = session?.user?.emailVerified
    const isAnonymous = session?.user?.isAnonymous
    const isManager = session?.user?.role === "manager" || session?.user?.role === "mgr" || isAdmin
    const pathname = useRouterState({ select: (s) => s.location.pathname })

    const isPathActive = (path: string) => {
        return pathname?.startsWith(path)
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-background/60 px-4 py-3 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="." className="flex items-center gap-2">
                    <svg
                        className="size-5"
                        fill="none"
                        height="45"
                        viewBox="0 0 60 45"
                        width="60"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            className="fill-black dark:fill-white"
                            clipRule="evenodd"
                            d="M0 0H15V45H0V0ZM45 0H60V45H45V0ZM20 0H40V15H20V0ZM20 30H40V45H20V30Z"
                            fillRule="evenodd"
                        />
                    </svg>
                    sipacate.
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-4">
                        {/* Only show these links if no session or email is verified */}
                        {(!session?.user || isEmailVerified) && (
                            <>
                                {isAdmin && (
                                    <span className="text-sm font-medium">
                                        Admin
                                    </span>
                                )}
                                {!session?.user && (
                                    <Link to="/pricing-page" className={cn("text-sm font-medium", isPathActive("/pricing-page") ? "text-primary" : "text-muted-foreground hover:text-primary")}>
                                        Pricing
                                    </Link>
                                )}
                                {isManager && session?.user && (
                                    <>
                                        {/* API Keys and API Docs links removed */}
                                    </>
                                )}
                                {session?.user && (
                                    <>
                                        <OrganizationSwitcher />

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link to="/events">
                                                        <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                            <FaCalendar className={cn("h-4 w-4", !isPathActive("/events") && "opacity-50")} />
                                                            <span className="sr-only">Lookups</span>
                                                        </Button>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Plan /View your Events</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </>
                                )}
                            </>
                        )}
                    </nav>

                    <ModeToggle />
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                </div>
            </div>
        </header>
    )
}
