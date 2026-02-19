"use client"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { site } from "@/config/site"

export const HeroSection = () => {
    const { theme } = useTheme()
    return (
        <section className="container mx-auto w-full px-4">
            <div className="grid gap-12 py-24 md:grid-cols-2 md:items-center md:gap-14 lg:grid-cols-[0.8fr,1.2fr] lg:gap-20 xl:gap-24 xl:py-32">
                {/* Left side - Copy */}
                <div className="space-y-8 text-center md:space-y-10 md:text-left">
                    <Badge
                        variant="outline"
                        className="rounded-2xl py-2 text-sm"
                    >
                        <span className="mr-2 text-primary">
                            <Badge>New</Badge>
                        </span>
                        <span> AI-Powered Task Management </span>
                    </Badge>

                    <div className="font-bold text-4xl md:text-5xl lg:text-6xl">
                        <h1>
                            Organize Your Life with
                            <span className="bg-gradient-to-r from-[#7033ff] to-primary bg-clip-text px-2 text-transparent">
                                ResilYou
                            </span>
                        </h1>
                    </div>

                    <p className="mx-auto max-w-lg text-muted-foreground text-lg leading-relaxed md:mx-0 lg:text-xl xl:max-w-xl">
                        {`The smart daily to-do list app that helps you stay productive.
                        Manage tasks, schedule events, and chat with your AI assistant
                        to get things done faster.`}
                    </p>

                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-3 md:items-start">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span>AI-powered task creation</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span>Smart calendar integration</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span>Natural language processing</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:justify-start">
                        <Button
                            asChild
                            size="lg"
                            className="group/arrow rounded-full"
                        >
                            <Link href="/auth/sign-up">
                                Start Organizing Free
                                <ArrowRight className="ml-2 size-5 transition-transform group-hover/arrow:translate-x-1" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-full"
                        >
                            <Link href="/auth/sign-in">
                                Sign In
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Right side - Preview */}
                <div className="group relative lg:scale-115">
                    {/* Enhanced animated glow effect */}
                    <div className="absolute inset-0 -z-10">
                        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[75%] w-[85%] animate-pulse bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 blur-3xl" />
                    </div>

                    {/* Browser Window Container */}
                    <div className="relative mx-auto w-full overflow-hidden rounded-xl border border-border/50 bg-background shadow-2xl transition-all duration-500 group-hover:shadow-primary/20">
                        <Image
                            width={1400}
                            height={1400}
                            className="relative flex w-full items-center"
                            src={
                                theme === "light" ? "/dash-light.png" : "/dash.png"
                            }
                            alt="ResilYou Dashboard Preview"
                            priority
                        />
                    </div>

                    {/* Decorative elements */}
                    <div className="-right-8 -bottom-8 absolute -z-10 size-32 rounded-full bg-primary/30 blur-3xl lg:size-40" />
                    <div className="-top-8 -left-8 absolute -z-10 size-28 rounded-full bg-primary/30 blur-3xl lg:size-36" />
                </div>
            </div>
        </section>
    )
}
