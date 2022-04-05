function testable (isTestable) {
  return function (target) {
    target.isTestable = isTestable
  }
}
@testable(true)
class MyTestableClass {
}
console.info(MyTestableClass.isTestable) // true

@testable(false)
class MyClass {
}
console.info(MyClass.isTestable) // false

export default testable
