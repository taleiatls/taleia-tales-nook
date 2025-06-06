
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // Disabled to remove all toast notifications
  return null;
}

// Disabled toast function - now accepts any arguments but does nothing
export const toast = {
  success: (...args: any[]) => {},
  error: (...args: any[]) => {},
  info: (...args: any[]) => {},
  warning: (...args: any[]) => {},
  loading: (...args: any[]) => {},
  promise: (...args: any[]) => {},
  dismiss: (...args: any[]) => {},
};

export { Toaster }
