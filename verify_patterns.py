neighbors = {
  'n0':['n1','n3','n4'],'n1':['n0','n2','n4','n5'],'n2':['n1','n5','n6'],
  'n3':['n0','n4','n7','n8'],'n4':['n0','n1','n3','n5','n8','n9'],
  'n5':['n1','n2','n4','n6','n9','n10'],'n6':['n2','n5','n10','n11'],
  'n7':['n3','n8','n12'],'n8':['n3','n4','n7','n9','n12','n13'],
  'n9':['n4','n5','n8','n10','n13','n14'],'n10':['n5','n6','n9','n11','n14','n15'],
  'n11':['n6','n10','n15'],'n12':['n7','n8','n13','n16'],
  'n13':['n8','n9','n12','n14','n16','n17'],'n14':['n9','n10','n13','n15','n17','n18'],
  'n15':['n10','n11','n14','n18'],'n16':['n12','n13','n17'],
  'n17':['n13','n14','n16','n18'],'n18':['n14','n15','n17'],
}

def edge(a, b):
    return b in neighbors[a]

def degs(ns):
    s = set(ns)
    return sorted(sum(1 for b in ns if b in s and edge(a, b)) for a in ns)

def econn(ns):
    ec = sum(1 for i, a in enumerate(ns) for b in ns[i+1:] if edge(a, b))
    vis = {ns[0]}
    q = [ns[0]]
    while q:
        c = q.pop()
        for nb in ns:
            if nb not in vis and edge(c, nb):
                vis.add(nb)
                q.append(nb)
    return ec, len(vis) == len(ns)

rounds = [
    ('line2',    ['n0', 'n1']),
    ('triangle', ['n4', 'n5', 'n9']),
    ('line3',    ['n7', 'n12', 'n16']),
    ('fork',     ['n14', 'n10', 'n13', 'n18']),
    ('line4',    ['n2', 'n6', 'n11', 'n15']),
]

claimed = []
all_pass = True
print("=== 5-ROUND PATTERN VERIFICATION ===\n")
for i, (nm, ns) in enumerate(rounds):
    overlap = [n for n in ns if n in claimed]
    d = degs(ns)
    ec, conn = econn(ns)
    ok = 'PASS' if not overlap and conn else 'FAIL'
    if ok == 'FAIL':
        all_pass = False
    print(f"R{i+1} {nm:10}  nodes={ns}")
    print(f"      degs={d}  edges={ec}  connected={conn}  overlap={overlap}  -> {ok}")
    claimed.extend(ns)
    print()

all_nodes = ['n' + str(i) for i in range(19)]
unclaimed = [n for n in all_nodes if n not in claimed]
print(f"Claimed {len(claimed)}/19  Unclaimed: {unclaimed}")
print(f"\nResult: {'ALL PASS' if all_pass else 'FAILURES FOUND'}")
