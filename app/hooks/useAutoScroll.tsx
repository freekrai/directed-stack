import { cn } from '~/utils/misc';
import React from 'react';

interface Props {
  // ID attribute of the checkbox.
  checkBoxId?: string;
  // Children to render in the scroll container.
  children: React.ReactNode;
  // Extra CSS class names.
  className?: string;
  // Height value of the scroll container.
  height?: number;
  // Text to use for the auto scroll option.
  optionText?: string;
  // Prevent all mouse interaction with the scroll conatiner.
  preventInteraction?: boolean;
  // Ability to disable the smooth scrolling behavior.
  scrollBehavior?: 'smooth' | 'auto';
  // Show the auto scroll option.
  showOption?: boolean;
}

/**
 * Base CSS class.
 * @private
 */
const baseClass = 'react-auto-scroll';

/**
 * Get a random string.
 * @private
 */
const getRandomString = () =>
  Math.random()
    .toString(36)
    .slice(2, 15);

/**
 * AutoScroll component.
 */
export default function AutoScroll({
  checkBoxId = getRandomString(),
  children,
  className,
  height,
  optionText = 'Auto scroll',
  preventInteraction = false,
  scrollBehavior = 'smooth',
  showOption = true,
}: Props) {
  const [autoScroll, setAutoScroll] = React.useState(true);
  const containerElement = React.useRef<HTMLDivElement>(null);
  const cls = cn(baseClass, className, {
    [`${baseClass}--empty`]: React.Children.count(children) === 0,
    [`${baseClass}--prevent-interaction`]: preventInteraction,
    [`${baseClass}--showOption`]: showOption,
  });
  const style = {
    height,
    overflow: 'auto',
    scrollBehavior: 'auto',
    pointerEvents: preventInteraction ? 'none' : 'auto',
  } as const;

  // Handle mousewheel events on the scroll container.
  const onWheel = () => {
    const { current } = containerElement;

    if (current && showOption) {
      setAutoScroll(current.scrollTop + current.offsetHeight === current.scrollHeight);
    }
  };

  // Apply the scroll behavior property after the first render,
  // so that the initial render is scrolled all the way to the bottom.
  React.useEffect(() => {
    setTimeout(() => {
      const { current } = containerElement;

      if (current) {
        current.style.scrollBehavior = scrollBehavior;
      }
    }, 0);
  }, [containerElement, scrollBehavior]);

  // When the children are updated, scroll the container
  // to the bottom.
  React.useEffect(() => {
    if (!autoScroll) {
      return;
    }

    const { current } = containerElement;

    if (current) {
      current.scrollTop = current.scrollHeight;
    }
  }, [children, containerElement, autoScroll]);

  return (
    <div className={cls}>
      <div
        className={`${baseClass}__scroll-container`}
        onWheel={onWheel}
        ref={containerElement}
        style={style}
      >
        {children}
      </div>

      {showOption && !preventInteraction && (
        <div className={`${baseClass}__option`}>
          <input
            checked={autoScroll}
            className={`${baseClass}__option-input`}
            id={`${baseClass}__option-input-${checkBoxId}`}
            onChange={() => setAutoScroll(!autoScroll)}
            type="checkbox"
          />

          <label
            className={`${baseClass}__option-text`}
            htmlFor={`${baseClass}__option-input-${checkBoxId}`}
          >
            {optionText}
          </label>
        </div>
      )}
    </div>
  );
}
