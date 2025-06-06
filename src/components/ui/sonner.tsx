
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // Disabled to remove all toast notifications
  return null;
}

// Disabled toast function
export const toast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  loading: () => {},
  promise: () => {},
  dismiss: () => {},
};

export { Toaster }
