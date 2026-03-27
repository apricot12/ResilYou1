"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Clock, Mail, MessageCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { site } from "@/config/site"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    firstName: z.string().min(2).max(255),
    lastName: z.string().min(2).max(255),
    email: z.string().email(),
    subject: z.string().min(2).max(255),
    message: z.string()
})

export const ContactSection = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            subject: "General Inquiry",
            message: ""
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        const { firstName, lastName, email, subject, message } = values
        const mailToLink = `mailto:${site.mailSupport}?subject=${subject}&body=Hello I am ${firstName} ${lastName}, my Email is ${email}. %0D%0A${message}`

        window.location.href = mailToLink
    }

    return (
        <section id="contact" className="container mx-auto px-4 py-16 sm:py-20">
            <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                    <div className="mb-4">
                        <h2 className="mb-2 text-lg text-primary tracking-wider">
                            Contact
                        </h2>

                        <h2 className="font-bold text-3xl md:text-4xl">
                            Get in touch
                        </h2>
                    </div>
                    <p className="mb-8 text-muted-foreground lg:w-5/6">
                        Have a question about ResilYou, need help getting started, or want to share feedback? We'd love to hear from you.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="mb-1 flex gap-2">
                                <Mail />
                                <div className="font-bold">Email us</div>
                            </div>
                            <div>{site.mailSupport}</div>
                        </div>

                        <div>
                            <div className="mb-1 flex gap-2">
                                <MessageCircle />
                                <div className="font-bold">Support</div>
                            </div>
                            <div>We typically respond within 24 hours on business days.</div>
                        </div>

                        <div>
                            <div className="flex gap-2">
                                <Clock />
                                <div className="font-bold">Hours</div>
                            </div>
                            <div>
                                <div>Monday - Friday</div>
                                <div>9AM - 6PM</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="bg-muted/60">
                    <CardContent className="p-4">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="grid w-full gap-4"
                            >
                                <div className="md:!flex-row flex flex-col gap-8">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>
                                                    First Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Jane"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Doe"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a subject" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                                        <SelectItem value="Account & Billing">Account & Billing</SelectItem>
                                                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                                                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                                                        <SelectItem value="Bug Report">Bug Report</SelectItem>
                                                        <SelectItem value="Partnership">Partnership</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={5}
                                                        placeholder="How can we help you?"
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button className="mt-4 w-fit">Send message</Button>
                            </form>
                        </Form>
                    </CardContent>

                    <CardFooter />
                </Card>
            </section>
        </section>
    )
}
