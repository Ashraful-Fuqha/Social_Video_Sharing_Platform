/* eslint-disable react/prop-types */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export const ErrorComp = ({
  title = "",
  description = "" ,
  className = "",
  icon = "success",
  alertVariant = "default"
}) => {
  return (
    <Alert variant={alertVariant} className={`${className}`}>
        {icon === "success" 
          ? <CheckCircle className="w-5 h-5" /> 
          : <AlertCircle className="w-5 h-5"/>
        }
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
        </AlertDescription>
    </Alert>
  )
}