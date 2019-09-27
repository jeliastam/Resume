# AngularJS based Project
2015  
Employer: Simply Interactive, Inc

This work was created while developing a "product selector" to help unsure customers pick the right mobile device for their needs.  Most of the code in these files was originally written by me, if not, it was updated and maintained by me after its creation.  Commented out functions were not written, maintained or updated by me.

### Point of Interest
* The carrierPlan directive (in directives.js).  

On a redesign of the existing content, a table of data that would be paginated was called for.  This pagination was a column-based pagination, as opposed to the standard row-based.  This posed a puzzle!  I could not find a single package that accomplished what I needed.  So, I refactored the table using divs to mimic rows and columns but inversely to how a table is usually structured.  The "columns" were the exterior wrapper around each row item.  This allowed for easy pagination that met the design requirements. [link to function](https://github.com/jeliastam/Resume/blob/master/angular/directives.js#L123)