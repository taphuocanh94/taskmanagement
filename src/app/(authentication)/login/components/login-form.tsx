'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Link from "next/link"
import { TbLoaderQuarter } from "react-icons/tb";
import login from "@/actions/login"
import { toast } from "sonner"
import { translate } from "@/app/app-provider"

const loginFormSchema = z.object({
  email: z.coerce.string().email().min(5),
  password: z.string().min(6),
}).required({
  email: true,
  password: true
})


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  // 1. Define your form.
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "admin@domain.com",
      password: "123123"
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const loginResponse = await login({
      email: values.email,
      password: values.password
    })
    if (loginResponse.success == true) {
      return true
    } else {
      // loginForm.setError("root", {type: "custom", message: loginResponse.errorMsg })
      loginForm.setError("root", {
        type: "custom"
      })
      toast.error("Đăng nhập không thành công", {
        description: loginResponse.errorMsg
      })
    }
  }

  return (
    <Form {...loginForm}>
      {!loginForm.formState.isSubmitSuccessful && <form method="post" className={cn("flex flex-col gap-6", className)} {...props} 
        onSubmit={loginForm.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="username@domain.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-3">

            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input placeholder="" {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    This is your private account password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting ? true : false}>
            {translate('loginBtn.label')} {loginForm.formState.isSubmitting && <TbLoaderQuarter   className="animate-spin" />}
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="#" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>}
      {loginForm.formState.isSubmitSuccessful && <>Đăng nhập thành công</>}
    </Form>
  )
}
