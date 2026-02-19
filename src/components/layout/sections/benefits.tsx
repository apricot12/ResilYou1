import type { icons } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"

interface BenefitsProps {
    icon: string
    title: string
    description: string
}

const benefitList: BenefitsProps[] = [
    {
        icon: "Rocket",
        title: "Stay Organized",
        description:
            "Keep all your tasks, appointments, and goals in one place. Never miss a deadline or forget an important task again."
    },
    {
        icon: "Bot",
        title: "AI Assistant",
        description:
            "Chat naturally with your AI assistant to create tasks, schedule events, and manage your day - just like talking to a personal helper."
    },
    {
        icon: "Calendar",
        title: "Smart Scheduling",
        description:
            "Integrated calendar helps you visualize your day. Set due dates, get reminders, and stay on top of your schedule effortlessly."
    },
    {
        icon: "Zap",
        title: "Boost Productivity",
        description:
            "Focus on what matters. Prioritize tasks, track completion, and build momentum with streaks and achievements."
    }
]

export const BenefitsSection = () => {
    return (
        <section id="benefits" className="container mx-auto px-4 py-16 sm:py-20">
            <div className="grid place-items-center lg:grid-cols-2 lg:gap-24">
                <div>
                    <h2 className="mb-2 text-lg text-primary tracking-wider">
                        Why ResilYou
                    </h2>

                    <h2 className="mb-4 font-bold text-3xl md:text-4xl">
                        Your Daily Productivity Partner
                    </h2>
                    <p className="mb-8 text-muted-foreground text-xl">
                        ResilYou combines the simplicity of a to-do list with the power of AI.
                        Get more done, stay organized, and achieve your goals - all in one beautiful app.
                    </p>
                </div>

                <div className="grid w-full gap-4 lg:grid-cols-2">
                    {benefitList.map(({ icon, title, description }, index) => (
                        <Card
                            key={title}
                            className="group/number transition-all delay-75 hover:bg-sidebar"
                        >
                            <CardHeader>
                                <div className="flex justify-between">
                                    <Icon
                                        name={icon as keyof typeof icons}
                                        size={32}
                                        color="var(--primary)"
                                        className="mb-6 text-primary"
                                    />
                                    <span className="font-medium text-5xl text-muted-foreground/15 transition-all delay-75 group-hover/number:text-muted-foreground/30">
                                        0{index + 1}
                                    </span>
                                </div>

                                <CardTitle>{title}</CardTitle>
                            </CardHeader>

                            <CardContent className="text-muted-foreground">
                                {description}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
