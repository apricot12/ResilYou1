import {
    RiTodoLine,
    RiRobot2Line,
    RiCalendarLine,
    RiCheckboxCircleLine,
    RiTimeLine,
    RiPriceTag3Line
} from "@remixicon/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeaturesProps {
    icon: React.ReactNode
    title: string
    description: string
}

const featureList: FeaturesProps[] = [
    {
        icon: <RiTodoLine size={24} className="text-primary" />,
        title: "Smart Task Lists",
        description:
            "Create, organize, and manage your daily tasks with priority levels, due dates, and custom categories."
    },
    {
        icon: <RiRobot2Line size={24} className="text-primary" />,
        title: "AI Chat Assistant",
        description:
            "Just tell your AI assistant what you need to do. It creates tasks and schedules events through natural conversation."
    },
    {
        icon: <RiCalendarLine size={24} className="text-primary" />,
        title: "Integrated Calendar",
        description:
            "Visualize your schedule with a beautiful calendar. Schedule meetings, set reminders, and never miss an appointment."
    },
    {
        icon: <RiCheckboxCircleLine size={24} className="text-primary" />,
        title: "Quick Actions",
        description:
            "Mark tasks complete, reschedule events, and update priorities with a single click or voice command."
    },
    {
        icon: <RiTimeLine size={24} className="text-primary" />,
        title: "Smart Reminders",
        description:
            "Get timely notifications for upcoming tasks and events. Never forget important deadlines again."
    },
    {
        icon: <RiPriceTag3Line size={24} className="text-primary" />,
        title: "Categories & Tags",
        description:
            "Organize tasks with custom categories. Filter by work, personal, shopping, or create your own labels."
    }
]

export const FeaturesSection = () => {
    return (
        <section id="features" className="container mx-auto px-4 py-16 sm:py-20">
            <h2 className="mb-2 text-center text-lg text-primary tracking-wider">
                Core Features
            </h2>

            <h2 className="mb-4 text-center font-bold text-3xl md:text-4xl">
                Built-in Functionality
            </h2>

            <h3 className="mx-auto mb-8 text-center text-muted-foreground text-xl md:w-1/2">
                Start with a solid foundation. Our app includes essential features that every productive person needs,
                saving you time and keeping you organized.
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featureList.map(({ icon, title, description }) => (
                    <div key={title}>
                        <Card className="h-full border-0 bg-background shadow-none">
                            <CardHeader className="flex items-center justify-center gap-4 align-middle pb-2">
                                <div className="rounded-full bg-primary/20 p-2 ring-8 ring-primary/10">
                                    {icon}
                                </div>

                                <CardTitle>{title}</CardTitle>
                            </CardHeader>

                            <CardContent className="text-center text-muted-foreground">
                                {description}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </section>
    )
}
