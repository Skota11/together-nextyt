import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from "next/link"

export function HomeNavigation() {
    return (
        <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem>
            <NavigationMenuTrigger>NextTube</NavigationMenuTrigger>
            <NavigationMenuContent className="p-8 grid gap-6 md:w-[400px] lg:w-[500px]">
                <NavigationMenuLink asChild>
                    <Link href={`https://www.nextyt.app`}>
                    <div className="text-sm leading-none font-medium">NextTube</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        YoutubeとNiconicoの共存クライアント
                    </p>
                    </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                    <Link href={`https://together.nextyt.app`}>
                    <div className="text-sm leading-none font-medium">Together</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        Youtubeの動画をウォッチパーティー
                    </p>
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuContent>
            </NavigationMenuItem>
        </NavigationMenuList>
        </NavigationMenu>
    )
}