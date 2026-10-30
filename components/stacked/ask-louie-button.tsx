import { AskLouieTrigger } from "@/components/ai/ask-louie-dialog";
import { cn } from "@/lib/utils";

/**
 * Ask Louie in the left column: a blue pill, the one filled control on a
 * page (Louie, 2026-10-29: the text link read as hidden). It sits under the
 * name, so it is on the first screen at every width.
 */
function AskLouieButton({ label, className }: { label?: string; className?: string }) {
  return (
    <AskLouieTrigger
      variant="primary"
      label={label}
      className={cn("ask-pill w-fit rounded-full", className)}
    />
  );
}

export { AskLouieButton };
