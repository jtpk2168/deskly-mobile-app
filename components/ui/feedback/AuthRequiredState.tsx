import { MaterialIcons } from "@expo/vector-icons";
import { StatePanel } from "./StatePanel";

type AuthRequiredStateProps = {
    title?: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
    icon?: keyof typeof MaterialIcons.glyphMap;
    className?: string;
};

export function AuthRequiredState({
    title = "Sign In Required",
    description = "Please sign in to continue.",
    actionLabel = "Go to Login",
    onActionPress,
    icon = "lock-outline",
    className,
}: AuthRequiredStateProps) {
    return (
        <StatePanel
            icon={icon}
            title={title}
            description={description}
            actionLabel={actionLabel}
            onActionPress={onActionPress}
            className={className}
        />
    );
}
