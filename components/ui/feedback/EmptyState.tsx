import { MaterialIcons } from "@expo/vector-icons";
import { StatePanel } from "./StatePanel";

type EmptyStateProps = {
    title: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
    icon?: keyof typeof MaterialIcons.glyphMap;
    className?: string;
};

export function EmptyState({
    title,
    description,
    actionLabel,
    onActionPress,
    icon = "inbox",
    className,
}: EmptyStateProps) {
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
