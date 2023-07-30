import { Link, useNavigate } from "@remix-run/react";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export interface TabItem {
    name: any;
    href?: string;
    current?: boolean;
  }

export default function Tabs({ tabs }: { tabs: any[]}) {
    const navigate = useNavigate();

    function selectTab(idx: number) {
        const tab = tabs[idx];
        if (tab?.href) {
            navigate(tab.href);
        }
    }
/*
<div className="bg-white shadow-sm border-b border-gray-300 w-full py-2 px-4">
*/
    return (
        <div className="bg-white border-b border-gray-200 py-2 px-4 w-full">
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    defaultValue={tabs.find((tab: any) => tab.current).name}
                    onChange={(e) => selectTab(Number(e.target.value))}
                >
                {tabs.map((tab: any, i: any) => (
                    <option key={i} value={i}>{tab.name}</option>
                ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab: any) => (
                        <Link
                            key={tab.name}
                            to={tab.href}
                            className={classNames(
                                tab.current
                                    ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700',
                                'px-3 py-2 font-medium text-sm rounded-md border-1 border-blue-300'
                            )}
                            aria-current={tab.current ? 'page' : undefined}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}

/*
import { Link, useLocation, useNavigate } from "@remix-run/react";

import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import UrlUtils from "~/utils/app/UrlUtils";

export interface TabItem {
  name: any;
  routePath?: string;
}

interface Props {
  className?: string;
  tabs: TabItem[];
  asLinks?: boolean;
  onSelected?: (idx: number) => void;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  exact?: boolean;
}

export default function Tabs({ className = "", breakpoint = "md", tabs = [], asLinks = true, onSelected, exact }: Props) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const [selected, setSelected] = useState(0);

  function selectTab(idx: number) {
    const tab = tabs[idx];
    setSelected(idx);
    if (asLinks) {
      if (tab?.routePath) {
        navigate(tab.routePath);
      }
    } else {
      if (onSelected) {
        onSelected(idx);
      }
    }
  }
  function isCurrent(idx: number) {
    return currentTab() === tabs[idx];
  }
  const currentTab = () => {
    if (asLinks) {
      if (exact) {
        return tabs.find((element) => element.routePath && UrlUtils.stripTrailingSlash(location.pathname) === UrlUtils.stripTrailingSlash(element.routePath));
      } else {
        return tabs.find((element) => element.routePath && (location.pathname + location.search).includes(element.routePath));
      }
    } else {
      return tabs[selected];
    }
  };
  return (
    <div className={className}>
      <div
        className={clsx(
          breakpoint === "sm" && "sm:hidden",
          breakpoint === "md" && "md:hidden",
          breakpoint === "lg" && "lg:hidden",
          breakpoint === "xl" && "xl:hidden",
          breakpoint === "2xl" && "2xl:hidden"
        )}
      >
        <label htmlFor="tabs" className="sr-only">
          {t("app.shared.tabs.select")}
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full focus:ring-accent-500 focus:border-accent-500 border-gray-300 rounded-md"
          onChange={(e) => selectTab(Number(e.target.value))}
          value={selected}
        >
          {tabs.map((tab, idx) => {
            return (
              <option key={tab.name} value={Number(idx)}>
                {tab.name}
              </option>
            );
          })}
        </select>
      </div>
      <div
        className={clsx(
          breakpoint === "sm" && "hidden sm:block",
          breakpoint === "md" && "hidden md:block",
          breakpoint === "lg" && "hidden lg:block",
          breakpoint === "xl" && "hidden xl:block",
          breakpoint === "2xl" && "hidden 2xl:block"
        )}
      >
        {(() => {
          if (asLinks) {
            return (
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs
                  .filter((f) => f.routePath)
                  .map((tab, idx) => {
                    return (
                      <Link
                        key={tab.name}
                        to={tab.routePath ?? ""}
                        className={clsx(
                          "truncate border",
                          isCurrent(idx) ? "bg-accent-100 text-accent-700 border border-accent-300" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                          "px-3 py-2 font-medium text-sm rounded-sm border-transparent"
                        )}
                        aria-current={isCurrent(idx) ? "page" : undefined}
                      >
                        {tab.name}
                      </Link>
                    );
                  })}
              </nav>
            );
          } else {
            return (
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs.map((tab, idx) => {
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => selectTab(idx)}
                      className={clsx(
                        "truncate border",
                        isCurrent(idx) ? "bg-accent-100 text-accent-700 border border-accent-300" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                        "px-3 py-2 font-medium text-sm rounded-sm border-transparent"
                      )}
                    >
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            );
          }
        })()}
      </div>
    </div>
  );
}
*/