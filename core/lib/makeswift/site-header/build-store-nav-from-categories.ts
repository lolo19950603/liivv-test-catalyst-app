import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';

export type StoreCategoryImage = {
  src: string;
  alt: string;
};

export type StoreCategoryNode = {
  name: string;
  path: string;
  image?: StoreCategoryImage | null;
  children?: StoreCategoryNode[];
};

const MEGA_MENU_COLUMN_COUNT = 5;

function collectMegaMenuLinks(node: StoreCategoryNode): Array<{
  label: string;
  href: string;
  image?: StoreCategoryImage | null;
}> {
  const links: Array<{ label: string; href: string; image?: StoreCategoryImage | null }> = [];

  for (const child of node.children ?? []) {
    if (child.children?.length) {
      for (const grandchild of child.children) {
        links.push({
          label: grandchild.name,
          href: grandchild.path,
          image: grandchild.image ?? null,
        });
      }
    } else {
      links.push({
        label: child.name,
        href: child.path,
        image: child.image ?? null,
      });
    }
  }

  return links;
}

export type MegaMenuLinkInput = {
  label: string;
  href: string;
  image?: StoreCategoryImage | null;
};

/** Spread sub links across five mega menu columns (round-robin). */
export function distributeIntoColumns(
  links: MegaMenuLinkInput[],
  columnCount = MEGA_MENU_COLUMN_COUNT,
): NonNullable<LiivvArchiveNavLink['columns']> {
  const columns = Array.from({ length: columnCount }, () => ({
    links: [] as MegaMenuLinkInput[],
  }));

  links.forEach((link, index) => {
    columns[index % columnCount]?.links.push(link);
  });

  return columns.filter((column) => column.links.length > 0);
}

function categoryToNavItem(node: StoreCategoryNode): LiivvArchiveNavLink {
  const megaLinks = collectMegaMenuLinks(node);
  const columns = megaLinks.length > 0 ? distributeIntoColumns(megaLinks) : undefined;

  return {
    label: node.name,
    href: node.path,
    featuredImage: node.image ?? null,
    columns,
    exploreAll:
      columns != null && columns.length > 0
        ? { label: 'Explore All', href: node.path }
        : undefined,
  };
}

/** Build top-level header nav + mega menus from the BigCommerce category tree. */
export function buildStoreNavFromCategoryTree(
  categoryTree: StoreCategoryNode[],
): LiivvArchiveNavLink[] {
  return categoryTree.map(categoryToNavItem);
}
