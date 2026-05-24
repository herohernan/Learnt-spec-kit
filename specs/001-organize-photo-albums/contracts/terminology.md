# Terminology Reference: Date-Grouped Photo Albums

All user-facing copy in `src/index.html`, `src/album.html`, and every JS
component MUST use the terms below.

| Canonical term | Meaning | Banned synonyms |
|---|---|---|
| **Album** | A user-created collection of photos with a title and date | Gallery, folder, set, stack |
| **Album date** | The required date assigned to an album (YYYY-MM-DD) | Event date, photo date |
| **Date group** | A visual section on the main page collecting albums with the same album date | Section, bucket, cluster |
| **Photo** | An image file the user has added to an album | Picture, image, attachment |
| **Photo tile** | The visual preview card for one photo inside an album | Thumbnail card, image card |
| **Reorder** | The action of changing an album's position in the list | Move into, nest, drag into |
| **Add photos** | CTA label for opening the file picker | Upload, attach, import |
| **Create album** | CTA label for opening the album creation form | New album, add album |

## State Labels

### Main page — Album list
- **Success**: Album cards visible, grouped by date
- **Loading**: "Loading albums…" + shimmer cards
- **Empty**: "No albums yet — create your first one"
- **Error**: "Could not load albums. [Retry]"

### Create album form
- **Success**: Modal closes, new card appears in correct date group
- **Validation error**: "Album title is required" / "Album date is required"
- **Save error**: "Could not save album. Please try again."

### Reorder
- **Success**: Insertion line disappears, cards settle in new order
- **Error**: "Could not save new order." (toast, non-blocking)

### Album detail — Photo tiles
- **Success**: Tile shows thumbnail
- **Loading**: Shimmer placeholder
- **Empty album**: "No photos yet — add some to this album"
- **Photo unavailable**: "Photo unavailable" (icon + text inside tile)
- **Load error**: "Could not load photos. [Retry]"
