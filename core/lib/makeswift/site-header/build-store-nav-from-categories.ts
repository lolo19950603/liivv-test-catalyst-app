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

export type MegaMenuLinkInput = {
  label: string;
  href: string;
  image?: StoreCategoryImage | null;
};

/** Spread flat sub links across five mega menu columns (Makeswift additional links). */
export function distributeIntoColumns(
  links: MegaMenuLinkInput[],
  columnCount = 5,
): NonNullable<LiivvArchiveNavLink['columns']> {
  const columns = Array.from({ length: columnCount }, () => ({
    links: [] as MegaMenuLinkInput[],
  }));

  links.forEach((link, index) => {
    columns[index % columnCount]?.links.push(link);
  });

  return columns.filter((column) => column.links.length > 0);
}

/** One column per pillar category; sub links are its children (or empty). */
function buildStoreMegaMenuColumns(node: StoreCategoryNode): NonNullable<LiivvArchiveNavLink['columns']> {
  return (node.children ?? []).map((child) => {
    const links: MegaMenuLinkInput[] = child.children?.length
      ? child.children.map((grandchild) => ({
          label: grandchild.name,
          href: grandchild.path,
          image: grandchild.image ?? null,
        }))
      : [];

    return {
      heading: {
        label: child.name,
        href: child.path,
        image: child.image ?? null,
      },
      links,
    };
  });
}

function categoryToNavItem(node: StoreCategoryNode): LiivvArchiveNavLink {
  const columns = buildStoreMegaMenuColumns(node);
  const hasMegaMenu = columns.length > 0;

  return {
    label: node.name,
    href: node.path,
    featuredImage: node.image ?? null,
    columns: hasMegaMenu ? columns : undefined,
    exploreAll: hasMegaMenu ? { label: 'Explore All', href: node.path } : undefined,
  };
}

/** Build top-level header nav + mega menus from the BigCommerce category tree. */
export function buildStoreNavFromCategoryTree(
  categoryTree: StoreCategoryNode[],
): LiivvArchiveNavLink[] {
  return categoryTree.map(categoryToNavItem);
}
