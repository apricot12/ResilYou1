import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"

interface FAQProps {
    question: string
    answer: string
    value: string
}

const FAQList: FAQProps[] = [
    {
        question: "Is ResilYou really free to use?",
        answer: "Yes! Our Free plan gives you unlimited tasks, AI task creation, and calendar integration at no cost — forever. Upgrade to Pro or Teams only when you need more advanced features.",
        value: "item-1"
    },
    {
        question: "How does the AI assistant work?",
        answer: "ResilYou's built-in AI chat lets you create, edit, and organise tasks using plain English. Just say something like \"Remind me to call the dentist next Tuesday\" and the AI will add it to your task list and calendar automatically.",
        value: "item-2"
    },
    {
        question: "Can I use ResilYou on mobile?",
        answer: "Absolutely. ResilYou is fully responsive and works great on any device — phone, tablet, or desktop. No app download required; just open it in your browser.",
        value: "item-3"
    },
    {
        question: "How does the calendar integration work?",
        answer: "Every task with a due date automatically appears on your ResilYou calendar. You can also create calendar events directly from the AI chat, or click any day on the calendar to add an event manually.",
        value: "item-4"
    },
    {
        question: "Can I organise tasks by category or priority?",
        answer: "Yes. You can assign each task a priority (low, medium, or high), a due date, and a custom category or tag. Filter and sort your task list however suits you best.",
        value: "item-5"
    },
    {
        question: "How do I cancel or change my plan?",
        answer: "You can upgrade, downgrade, or cancel at any time from your account settings. If you cancel a paid plan, you keep access until the end of your billing period and then automatically revert to the Free plan.",
        value: "item-6"
    }
]

export const FAQSection = () => {
    return (
        <section id="faq" className="container mx-auto px-4 py-16 sm:py-20 md:w-[700px]">
            <div className="mb-8 text-center">
                <h2 className="mb-2 text-center text-lg text-primary tracking-wider">
                    FAQs
                </h2>

                <h2 className="text-center font-bold text-3xl md:text-4xl">
                    Common Questions
                </h2>
            </div>

            <Accordion type="single" collapsible className="AccordionRoot">
                {FAQList.map(({ question, answer, value }) => (
                    <AccordionItem key={value} value={value}>
                        <AccordionTrigger className="text-left">
                            {question}
                        </AccordionTrigger>

                        <AccordionContent>{answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    )
}
