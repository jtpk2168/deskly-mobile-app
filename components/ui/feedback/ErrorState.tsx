import { MaterialIcons } from "@expo/vector-icons";
import { StatePanel } from "./StatePanel";

type ErrorStateProps = {
    title?: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
    icon?: keyof typeof MaterialIcons.glyphMap;
    className?: string;
};

export function ErrorState({
    title = "Something went wrong",
    description,
    actionLabel,
    onActionPress,
    icon = "wifi-off",
    className,
}: ErrorStateProps) {
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
