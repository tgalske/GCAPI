# GCAPI

## Objects

### Content
A piece of content represents an image or video.

| Name | Type | Example | Notes |
| ------------- | ------------- | ------------- | ------------- |
| `title`  | String | Hello, world! |
| `fileId`  | String | 943ed0a8-a42a-11e8-98d0-529269fb1459 | UUID Version 1
| `fileType`  | String | .jpg |
| `isImage` | boolean | `true` |
| `tags` | [String] | [alpha, bravo] | 0 or many tags

### Member
A member represents a person in the GC.

| Name | Type | Example | Notes |
| ------------- | ------------- | ------------- | ------------- |
| `id`  | String | b63e5214-ad62-11e8-98d0-529269fb1459 | UUID Version 1
| `firstname`  | String | George |
| `lastname`  | String | Washington |
| `phone`  | String | 8608675309 | Numbers only
| `college` | Object | `true` |
| `college.name` | String | University of Connecticut |
| `college.city` | String | Storrs |
| `college.state` | String | Connecticut |
| `college.color` | String | college_02254B | `college_` prefix followed by hex color code

### Quote
A quote belongs to one and only one member.

| Name | Type | Example | Notes |
| ------------- | ------------- | ------------- | ------------- |
| `id`  | String | 7fd6e5f6-ad62-11e8-98d0-529269fb1459 | UUID Version 1
| `memberId`  | String | 7a0c5034-ad62-11e8-98d0-529269fb1459 | UUID Version 1
| `quote`  | String | |
| `isVisible` | boolean | `true` |

## Endpoints

### Content
* `GET` `/content`
* `GET` `/content/id/:fileId`
* `GET` `/content/search?query=<search query>`
* `POST` `/content/post`

| Post Body | Type | Example | Notes |
| ------------- | ------------- | ------------- | ------------- |
| `title`  | String | Hello, world! |
| `fileId`  | String | 943ed0a8-a42a-11e8-98d0-529269fb1459 | UUID Version 1
| `file` | File |  |


### Members
* `GET` `/members`
* `GET` `/members/id/:memberId`

### Quotes
* `GET` `/quotes`
* `GET` `/quotes/members/:memberId`
* `GET` `/quotes/id/:quoteId`
* `PUT` `/quotes/id/:quoteId`

| Put Body | Type |
| ------------- | ------------- |
| `quote`  | String |

* `PUT` `/quotes/id/hide/:quoteId`
* `POST` `/quotes`

| Put Body | Type |
| ------------- | ------------- |
| `quote`  | String |


