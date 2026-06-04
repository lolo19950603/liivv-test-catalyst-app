import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';

export type StoreCategoryNode = {
  name: string;
  path: string;
  children?: StoreCategoryNode[];
};

const MEGA_MENU_COLUMN_COUNT = 5;

function collectMegaMenuLinks(node: StoreCategoryNode): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [];

  for (const child of node.children ?? []) {
    if (child.children?.length) {
      for (const grandchild of child.children) {
        links.push({ label: grandchild.name, href: grandchild.path });
      }
    } else {
      links.push({ label: child.name, href: child.path });
    }
  }

  return links;
}

function distributeIntoColumns(
  links: Array<{ label: string; href: string }>,
  columnCount = MEGA_MENU_COLUMN_COUNT,
): NonNullable<LiivvArchiveNavLink['columns']> {
  const columns = Array.from({ length: columnCount }, () => ({
    links: [] as Array<{ label: string; href: string }>,
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
