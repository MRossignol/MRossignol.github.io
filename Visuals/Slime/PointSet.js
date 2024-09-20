
class PointSetElem {

  constructor(point, next) {
    this.point = point;
    this.next = next;
  }

  static pointCompare(p1, p2) {
    if (p1[0] > p2[0])
      return 1;
    if (p1[0] < p2[0])
      return -1;
    if (p1[1] > p2[1])
      return 1;
    if (p1[1] < p2[1])
      return -1;
    return 0;
  }

  compare(point) {
    return PointSetElem.pointCompare(this.point, point);
  }
  
}


class PointSet {

  first = null;
  size = 0;
  logged = false;

  *[Symbol.iterator] () { 
    let current = this.first;
    while (current) {
      yield current.point;
      current = current.next;
    }
  }
  
  add (points) {
    if (!Array.isArray(points))
      points = [points];
    if (points.length == 0) return;
    if (!Array.isArray(points[0]))
      points = [points];
    points.sort(PointSetElem.pointCompare);
    let pos = 0;
    if (this.first == null || this.first.compare(points[0]) > 0) {
      pos = 1;
      this.size++;
      this.first = new PointSetElem(points[0], this.first);
    }
    let current = this.first;
    while (current && pos < points.length) {
      switch (current.compare(points[pos])) {
      case 1:
	console.error('Wrong order when adding elements to set, this shouldn\'t happen');
	return;
      case 0:
	pos ++;
	break;
      case -1:
	if (!current.next || current.next.compare(points[pos]) == 1) {
	  current.next = new PointSetElem(points[pos], current.next);
	  this.size++;
	  current = current.next;
	  pos++;
	} else if (current.next.compare(points[pos]) == 0) {
	  current = current.next;
	  pos++;
	} else {
	  current = current.next;
	}
      }
    }
  }
  
  remove (points) {
    if (!Array.isArray(points))
      points = [points];
    if (points.length == 0) return;
    points.sort(PointSetElem.pointCompare);
    let pos = 0;
    let initSize = this.size;
    while (this.first && pos < points.length && this.first.compare(points[pos]) == 0) {
      this.first = this.first.next;
      this.size--;
      pos++;
    }
    let current = this.first;
    while (current && pos < points.length) {
      switch (current.compare(points[pos])) {
      case 1:
	pos++;
	break;
      case 0:
	console.error('Wrong order when removing elements from set, this shouldn\'t happen');
	return;
      case -1:
	if (current.next && current.next.compare(points[pos]) == 0) {
	  current.next = current.next.next;
	  this.size--;
	  pos++;
	} else if (current.next && current.next.compare(points[pos]) == -1) {
	  current = current.next;
	} else {
	  pos ++;
	}
      }
    }
  }

  toString () {
    return '{ '+[...this].map(p => `(${p[0]}, ${p[1]})`).join(', ')+' }';
  }

  testAndRemove (predicate) {
    let removed = [];
    while (this.first && predicate(this.first.point)) {
      removed.push(this.first.point);
      this.first = this.first.next;
      this.size--;
    }
    if (!this.first) return removed;
    let current = this.first;
    while (current.next) {
      if (predicate(current.next.point)) {
	removed.push(current.next.point);
	current.next = current.next.next;
	this.size--;
      } else {
	current = current.next;
      }
    }
    return removed;
  }
  
}
