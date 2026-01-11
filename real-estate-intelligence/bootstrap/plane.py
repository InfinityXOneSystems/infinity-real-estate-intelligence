from bootstrap.register import register_all
from bootstrap.health import readiness

def start():
    register_all()
    return readiness()

if __name__ == "__main__":
    print(start())
