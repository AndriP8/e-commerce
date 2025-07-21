import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | E-Commerce Store',
  description: 'Sign up for a new account to start shopping with us',
  keywords: 'register, sign up, create account, e-commerce',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/register`,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}